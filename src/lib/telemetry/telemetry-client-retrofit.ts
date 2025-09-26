import dgram from "node:dgram";

// Import the settings JSON file outlining the telemetry struct formats
import ip from "ip";
import struct from "python-struct";
import SettingJSON from "./settings-retrofit.json";
import type { UI_DATASOURCE_TARGETS } from "./constants/ui-targets";

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
      (s) => s.socket.address().port === port,
    );

    // Fail silently (just return the existing port)
    if (existingSocket) return existingSocket;

    // Check IP protocol (IPv4 vs IPv6)

    const validProtocol = ip.isV4Format(host) ?? ip.isV6Format(host);
    if (!validProtocol) throw new Error("Invalid IP address format");

    // Create a UDP IPv4 socket
    const newSocket = dgram.createSocket(ip.isV4Format(host) ? "udp4" : "udp6");

    newSocket.bind(port, host);

    // Push socket to list
    const portSettings = this.#getSettingsByPort(port);
    if (!portSettings) throw new Error("No settings found for port " + port);
    const telemetrySocket = new TelemetrySocket(
      portSettings.fstring,
      newSocket,
      portSettings.keys,
      uiSourceMap,
    );
    this.#sockets.push(telemetrySocket);

    // Remove the socket if it closes.
    newSocket.on("close", () => {
      this.#sockets = this.#sockets.filter((s) => s !== telemetrySocket);
    });

    return telemetrySocket;
  }

  removeSource(host: string, port: number) {
    const socket = this.#sockets.find(
      (p) =>
        p.socket.address().address === host && p.socket.address().port === port,
    );
    if (!socket) throw new Error("The socket does not exist");

    try {
      socket.socket.disconnect();
    } catch (e) {
      console.error("Could not disconnect socket: ", e);
    }

    // Remove the socket from the sockets list
    this.#sockets = this.#sockets.filter(
      (s) =>
        !(
          s.socket.address().address === host &&
          s.socket.address().port === port
        ),
    );
  }

  getSources() {
    return this.#sockets;
  }

  #getSettingsByPort(port: number) {
    // Extract all data_streams objects from all devices
    console.log(
      Object.values(settings)
        .flatMap((device) => device.data_streams)
        .find((stream) => stream?.local_port === port),
    );
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
  ) {
    this.fstring = fstring;
    this.socket = socket;
    this.labels = labels;
    this.uiDataMap = uiTargets;
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
