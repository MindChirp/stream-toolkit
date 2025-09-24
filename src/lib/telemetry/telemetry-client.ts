import dgram from "node:dgram";

// Import the settings JSON file outlining the telemetry struct formats
import ip from "ip";
import struct from "python-struct";
import SettingJSON from "./settings.json";

type PortSettings = {
  id: string;
  port: number;
  keys: string[];
  fstring: string;
  aggregation_factor: number;
};
type Settings = Record<"ECU" | "FC" | "Filling", Record<string, PortSettings>>;

const settings: Settings = SettingJSON as unknown as Settings;

export class ServerEventHandler {
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
  addSource(source: string) {
    if (!this.#hasPort(source))
      throw new Error("Invalid source format (Port not defined)");
    const port = this.#getPort(source);
    // Get the address

    // Check if a socket for this port already exists
    const existingSocket = this.#sockets?.find(
      (s) => s.socket.address().port === port,
    );

    // Fail silently (just return the existing port)
    if (existingSocket) return existingSocket;

    // Check IP protocol (IPv4 vs IPv6)

    const address = this.#stripPort(source);
    const validProtocol = ip.isV4Format(address!) ?? ip.isV6Format(address!);
    if (!validProtocol) throw new Error("Invalid IP address format");

    // Create a UDP IPv4 socket
    const newSocket = dgram.createSocket(
      ip.isV4Format(address!) ? "udp4" : "udp6",
    );

    newSocket.bind(port, address);

    // Push socket to list
    const portSettings = this.#getSettingsByPort(port);
    if (!portSettings) throw new Error("No settings found for port " + port);
    const telemetrySocket = new TelemetrySocket(
      portSettings.fstring,
      newSocket,
      portSettings.keys,
    );
    this.#sockets.push(telemetrySocket);

    // Remove the socket if it closes.
    newSocket.on("close", () => {
      this.#sockets = this.#sockets.filter((s) => s !== telemetrySocket);
    });

    return telemetrySocket;
  }

  // setSource(source: string) {
  //   // parse "host:port" but only use port for binding

  //   const port = this.#getPort(source);

  //   if (this.#socket) this.#socket.close();

  //   // Match Python: IPv4 UDP
  //   this.#socket = dgram.createSocket("udp4");

  //   // Bind BEFORE the Python sender starts; use 0.0.0.0 so we receive
  //   // packets regardless of whether the sender targets 127.0.0.1 or other
  //   this.#socket.bind(port, "0.0.0.0");

  //   this.#socket.on("listening", () => {
  //     const addr = this.#socket!.address();
  //     console.log(
  //       `Listening on ${typeof addr === "string" ? addr : `${addr.address}:${addr.port}`}`,
  //     );
  //   });

  //   // Optionally validate size:
  //   // if (msg.length !== calcSize(fstring)) { console.warn("Unexpected packet length"); return; }

  //   this.#socket.on("message", (msg, rinfo) => {
  //     // decode here
  //     const s = this.#getSettingsByPort(8080);
  //     console.log(struct.sizeOf(s.fstring), "Received: ", msg.length);
  //     console.log(struct.unpack(s.fstring, msg));
  //   });

  //   this.#socket.on("error", (err) => console.error("Socket error:", err));
  //   this.#socket.on("close", () => console.log("Socket closed"));
  // }

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
  socket: dgram.Socket;
  fstring: string;
  labels: string[];

  constructor(fstring: string, socket: dgram.Socket, labels: string[]) {
    this.fstring = fstring;
    this.socket = socket;
    this.labels = labels;
  }

  decode(buff: Buffer<ArrayBufferLike>) {
    // Decode the message based on the provided format string
    if (!this.fstring) throw new Error("Format string not defined");

    const decoded = struct.unpack(this.fstring, buff);
    // Map the decoded values to their corresponding labels
    if (decoded.length !== this.labels.length)
      throw new Error("Label count mismatch");
    return Object.fromEntries(
      this.labels.map((label, i) => [label, decoded[i]]),
    );
  }
}
