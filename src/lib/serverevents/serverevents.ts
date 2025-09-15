import dgram from "node:dgram";
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

const settings: Settings = SettingJSON as Settings;

const getSettingsByPort = (port: number) => {
  return Object.values(settings)
    .flatMap(Object.values)
    .find((s: PortSettings) => s.port === port) as PortSettings;
};

export class ServerEventHandler {
  #socket: dgram.Socket | null = null;

  onMessage(callback: (msg: Buffer, rinfo: dgram.RemoteInfo) => void) {
    this.#socket?.on("message", callback);
  }

  setSource(source: string) {
    // parse "host:port" but only use port for binding

    const port = this.#getPort(source);

    if (this.#socket) this.#socket.close();

    // Match Python: IPv4 UDP
    this.#socket = dgram.createSocket("udp4");

    // Bind BEFORE the Python sender starts; use 0.0.0.0 so we receive
    // packets regardless of whether the sender targets 127.0.0.1 or other
    this.#socket.bind(8080, "0.0.0.0");

    this.#socket.on("listening", () => {
      const addr = this.#socket!.address();
      console.log(
        `Listening on ${typeof addr === "string" ? addr : `${addr.address}:${addr.port}`}`,
      );
    });

    // Optionally validate size:
    // if (msg.length !== calcSize(fstring)) { console.warn("Unexpected packet length"); return; }

    this.#socket.on("message", (msg, rinfo) => {
      // decode here
      const s = getSettingsByPort(8080);
      console.log(struct.sizeOf(s.fstring), "Received: ", msg.length);
      console.log(struct.unpack(s.fstring, msg));
    });

    this.#socket.on("error", (err) => console.error("Socket error:", err));
    this.#socket.on("close", () => console.log("Socket closed"));
  }

  #getPort(source: string) {
    const [, p] = source.split(":");
    const port = Number(p);
    if (!Number.isInteger(port)) throw new Error("Invalid source format");
    return port;
  }
}
