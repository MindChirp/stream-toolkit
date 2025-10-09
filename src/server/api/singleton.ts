import { ServerEventHandlerHeimdall } from "@/lib/telemetry/telemetry-client-heimdall";
import EventEmitter from "events";
import { Overlay } from "./types/overlay";

type Handler = ServerEventHandlerHeimdall;

const g = globalThis as {
  __ee?: EventEmitter;
  __overlay?: Overlay;
  __serverListener?: Handler;
};

export const ee: EventEmitter = g.__ee ?? new EventEmitter();

if (!g.__ee) {
  g.__ee = ee;

  ee.setMaxListeners(1000);
}

export const overlay: Overlay = g.__overlay ?? new Overlay();
g.__overlay ??= overlay;

export const serverListener: Handler =
  g.__serverListener ?? new ServerEventHandlerHeimdall();
g.__serverListener ??= serverListener;
