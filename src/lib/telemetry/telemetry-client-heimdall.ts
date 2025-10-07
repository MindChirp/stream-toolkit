import dgram from "node:dgram";

// Import the settings JSON file outlining the telemetry struct formats
import { TRPCError } from "@trpc/server";
import ip from "ip";
import struct from "python-struct";
import { UI_DATASOURCE_TARGETS } from "./constants/ui-targets";
import SettingJSON from "./settings.json";

export type UiMap = {
  from: string;
  uiTarget: (typeof UI_DATASOURCE_TARGETS)[number];
};

type PortSettings = {
  id: string;
  port: number;
  keys: string[];
  fstring: string;
  aggregation_factor: number;
};

type Settings = Record<
  "ECU" | "FC",
  {
    ip: string;
    data_streams: PortSettings[];
  }
>;

const settings: Settings = SettingJSON as unknown as Settings;

export class ServerEventHandlerHeimdall {
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
  addSource(
    host: string,
    port: number,
    uiSourceMap: UiMap[],
    signOfLife?: "ecu" | "fc",
  ) {
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

    try {
      newSocket.bind(port, host);
    } catch {
      // Remove socket from the list
      this.#sockets = this.#sockets.filter(
        (s) => !(s.host === host && s.port === port),
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not open socket to telemetry source",
      });
    }

    // Push socket to list
    const portSettings = this.#getSettingsByPort(port);
    if (!portSettings)
      throw new TRPCError({
        code: "BAD_REQUEST",
        cause: "Invalid port",
        message: "No settings found for port " + port,
      });

    const telemetrySocket = new TelemetrySocket(
      portSettings.fstring,
      newSocket,
      portSettings.keys,
      uiSourceMap,
      host,
      port,
      signOfLife,
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
      (p) => p.host === host && p.port === port,
    );
    if (!socket)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "The socket does not exist",
      });

    try {
      // Remove the socket from the sockets list
      this.#sockets = this.#sockets.filter(
        (s) => !(s.host === host && s.port === port),
      );

      socket.kill();
    } catch (e) {
      console.error("Could not disconnect socket: ", e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        cause: "Could not disconnect from the socket",
        message: JSON.stringify(e),
      });
    }
  }

  getSources() {
    return this.#sockets;
  }

  #getSettingsByPort(port: number) {
    return Object.values(settings)
      .flatMap(Object.values)
      .find((s: PortSettings) => s.port === port) as PortSettings;
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

  #messageCallbacks: ((data: DecodedData) => void)[] = [];
  #signOfLifeTimeout: NodeJS.Timeout | undefined;

  #signOfLife:
    | {
        type: "ecu" | "fc";
        isAlive: boolean;
      }
    | undefined;

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
    signOfLife?: "fc" | "ecu",
  ) {
    this.fstring = fstring;
    this.socket = socket;
    this.labels = labels;
    this.uiDataMap = uiTargets;
    this.host = host;
    this.port = port;

    // If this is a sign of life socket for either the ECU or FC, a listener must be set up
    if (signOfLife) this.#setupSignOfLifeListener(signOfLife);

    // Set up a socket message listener
    socket.on("message", (msg: Buffer) =>
      this.#handleSocketMessage(this.decode(msg)),
    );
  }

  #setupSignOfLifeListener(signOfLife: "fc" | "ecu") {
    this.#signOfLife = {
      isAlive: false,
      type: signOfLife,
    };

    this.#signOfLifeTimeout = setInterval(() => {
      if (this.#signOfLife) {
        this.#signOfLife.isAlive = false;

        console.log("NO SIGN OF LIFE");

        const signOfLife = this.#signOfLife
          ? this.#signOfLife.type === "ecu"
            ? { ecu_active: this.#signOfLife.isAlive }
            : { fc_active: this.#signOfLife.isAlive }
          : {};

        this.#handleSocketMessage({
          telemetry: signOfLife,
          uiMappedTelemetry: signOfLife as Record<
            (typeof UI_DATASOURCE_TARGETS)[number],
            unknown
          >,
          uiMaps: [],
        });

        // Inform socket listeners of change in lifesign
      }
    }, 1000);

    this.socket.on("message", () => {
      // Reset the timeout
      if (this.#signOfLife) this.#signOfLife.isAlive = true;
      this.#signOfLifeTimeout?.refresh();
    });
  }

  kill() {
    this.#signOfLifeTimeout?.close();
    this.socket.close();
  }

  #handleSocketMessage(data: DecodedData) {
    this.#messageCallbacks.forEach((cb) => cb(data));
    return;
  }

  onMessage(callback: (data: DecodedData) => void) {
    this.#messageCallbacks.push(callback);
  }

  decode(buff: Buffer<ArrayBufferLike>) {
    // Decode the message based on the provided format string
    if (!this.fstring) throw new Error("Format string not defined");

    const decoded = struct.unpack(this.fstring, buff);
    // Map the decoded values to their corresponding labels
    // Also include the ui data map

    const telemetry = Object.fromEntries(
      this.labels.map((label, i) => [label, decoded[i]]),
    );

    const mapped = (UI_DATASOURCE_TARGETS as readonly string[]).reduce(
      (acc, key) => {
        acc[key as (typeof UI_DATASOURCE_TARGETS)[number]] =
          this.uiDataMap.find((m) => m.uiTarget === key)
            ? telemetry[this.uiDataMap.find((m) => m.uiTarget === key)!.from]
            : undefined;
        return acc;
      },
      {} as Record<(typeof UI_DATASOURCE_TARGETS)[number], unknown>,
    );

    const signOfLife = this.#signOfLife
      ? this.#signOfLife.type === "ecu"
        ? { ecu_active: this.#signOfLife.isAlive }
        : { fc_active: this.#signOfLife.isAlive }
      : {};

    return {
      uiMaps: this.uiDataMap,
      telemetry: {
        ...telemetry,
        ...signOfLife,
      },
      uiMappedTelemetry: {
        ...mapped,
        ...signOfLife,
      },
    } as DecodedData;
  }
}

export type DecodedData = {
  uiMaps: UiMap[];
  telemetry: Record<string, unknown>;
  uiMappedTelemetry: Record<(typeof UI_DATASOURCE_TARGETS)[number], unknown>;
};
