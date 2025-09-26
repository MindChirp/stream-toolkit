import dgram from "node:dgram";

// Import the settings JSON file outlining the telemetry struct formats
import ip from "ip";
import struct from "python-struct";
import SettingJSON from "./settings-retrofit.json";
import type { UI_DATASOURCE_TARGETS } from "./constants/ui-targets";
import { TRPCError } from "@trpc/server";

export type UiMap = {
  from: string;
  uiTarget: (typeof UI_DATASOURCE_TARGETS)[number];
};

type PortSettings = {
  id: string;
  bidirectional: boolean;
  buffer_size: number;
  local_port: number;
  remote_port: number;
  type: string;
  format: string;
  keys: string[];
  fstring: string;
  aggregation_factor: number;
  append_ts: boolean;
  // conversion_fn: unknown;
};

type Settings = Record<
  "ECU" | "FC",
  {
    ip: string;
    data_streams: PortSettings[];
  }
>;

const settings: Settings = SettingJSON as unknown as Settings;

export class ServerEventHandlerRetrofit {
  #sockets: TelemetrySocket[] = [];

  #hasPort(source: string) {
    const regex = /^(?:[0-9.]+|(?:\[[0-9a-fA-F:]+\]))(:[0-9]+)$/;
    return regex.test(source);
  }

  #stripPort(source: string) {
    // IPv6 with port, e.g. [2001:db8::1]:8080
    if (source.startsWith("[")) {
      const match = /^\[([^\]]+)\](?::\d+)?$/.exec(source);
      if (match) {
        return match[1];
      }
    }

    // IPv4 with port, e.g. 127.0.0.1:8080
    // (ensure it's not an IPv6 without brackets)
    if (
      source.includes(":") &&
      source.indexOf(":") === source.lastIndexOf(":")
    ) {
      return source.split(":")[0];
    }

    // Bare IPv6 or IPv4 without port
    return source;
  }

  /**
   * Add a telemetry source by specifying its address and port in the format "address:port".
   * The address can be an IPv4 or IPv6 address.
   * If a socket for the specified port already exists, it will return the existing socket.
   * If the source format is invalid or the IP address is not valid, an error will be thrown.
   *
   * The created socket will be returned, enabling the caller to set up event listeners as needed.
   * @param source Source IPv4 or IPv6 address with port. For IPv6, use [address]:port format.
   * @returns The created or existing dgram.Socket instance.
   */
  addSource(host: string, port: number, uiSourceMap: UiMap[]) {
    // Check if a socket for this port already exists
    const existingSocket = this.#sockets?.find(
      (s) => s.port === port && s.host === host,
    );

    // Fail silently (just return the existing port)
    if (existingSocket) return existingSocket;

    // Check IP protocol (IPv4 vs IPv6)

    const validProtocol = ip.isV4Format(host) ?? ip.isV6Format(host);
    if (!validProtocol)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid IP address format",
      });

    // Create a UDP IPv4 socket
    const newSocket = dgram.createSocket(ip.isV4Format(host) ? "udp4" : "udp6");

    console.log("HERE!");
    try {
      console.log("HERE 1");
      newSocket.bind(port, host);
      console.log("HERE 2");
    } catch {
      // Remove socket from the list
      console.log("FUCK");
      this.#sockets = this.#sockets.filter(
        (s) => !(s.host === host && s.port === port),
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not open socket to telemetry source",
      });
    }

    console.log("HERE 3");
    // Push socket to list
    const portSettings = this.#getSettingsByPort(port);
    if (!portSettings)
      throw new TRPCError({
        code: "BAD_REQUEST",
        cause: "Invalid port",
        message: "No settings found for port " + port,
      });

    console.log("HERE 4");
    const telemetrySocket = new TelemetrySocket(
      portSettings.fstring,
      newSocket,
      portSettings.keys,
      uiSourceMap,
      host,
      port,
    );
    this.#sockets.push(telemetrySocket);

    console.log("HERE 5");

    // Remove the socket if it closes.
    newSocket.on("close", () => {
      this.#sockets = this.#sockets.filter((s) => s !== telemetrySocket);
    });

    return telemetrySocket;
  }

  removeSource(host: string, port: number) {
    const socket = this.#sockets.find(
      (p) => p.host === host && p.port === port,
    );
    if (!socket)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The socket does not exist",
      });

    try {
      socket.socket.disconnect();
    } catch (e) {
      console.error("Could not disconnect socket: ", e);
    }

    // Remove the socket from the sockets list
    this.#sockets = this.#sockets.filter(
      (s) => !(s.host === host && s.port === port),
    );
  }

  getSources() {
    return this.#sockets;
  }

  #getSettingsByPort(port: number) {
    // Extract all data_streams objects from all devices

    return Object.values(settings)
      .flatMap((device) => device.data_streams)
      .find((stream) => stream?.local_port === port);
  }

  #getPort(source: string) {
    const [, p] = source.split(":");
    const port = Number(p);
    if (!Number.isInteger(port)) throw new Error("Invalid source format");
    return port;
  }
}

/**
 * TelemetrySocket wraps a dgram.Socket and includes the format string for decoding messages.
 * TODO: Implement rate limiting algorithm as a frontline defense against data flooding to the stream overlay?
 */
export class TelemetrySocket {
  readonly socket: dgram.Socket;
  readonly fstring: string;
  readonly labels: string[];
  readonly uiDataMap: UiMap[];
  readonly host: string;
  readonly port: number;

  constructor(
    fstring: string,
    socket: dgram.Socket,

    labels: string[],
    uiTargets: {
      /**
       * A string from the this.labels array
       */

      from: string;
      /**
       * The target stream overlay UI element
       */
      uiTarget: (typeof UI_DATASOURCE_TARGETS)[number];
    }[],
    host: string,
    port: number,
  ) {
    this.fstring = fstring;
    this.socket = socket;
    this.labels = labels;
    this.uiDataMap = uiTargets;
    this.host = host;
    this.port = port;
  }

  decode(buff: Buffer<ArrayBufferLike>) {
    // Decode the message based on the provided format string
    if (!this.fstring) throw new Error("Format string not defined");

    const decoded = struct.unpack(this.fstring, buff);
    // Map the decoded values to their corresponding labels
    // Also include the ui data map

    return {
      uiMaps: this.uiDataMap,
      telemetry: Object.fromEntries(
        this.labels.map((label, i) => [label, decoded[i]]),
      ),
    } as DecodedData;
  }
}

export type DecodedData = {
  uiMaps: UiMap[];
  telemetry: Record<string, unknown>;
};
