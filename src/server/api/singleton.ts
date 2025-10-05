import EventEmitter from "events";
import { Overlay } from "./types/overlay";
import { ServerEventHandlerRetrofit } from "@/lib/telemetry/telemetry-client-retrofit";

const g = globalThis as {
  __ee?: EventEmitter;
  __overlay?: Overlay;
  __serverListener?: ServerEventHandlerRetrofit;
};

export const ee: EventEmitter = g.__ee ?? new EventEmitter();

if (!g.__ee) {
  g.__ee = ee;

  ee.setMaxListeners(1000);
}

export const overlay: Overlay = g.__overlay ?? new Overlay();
g.__overlay ??= overlay;

export const serverListener: ServerEventHandlerRetrofit =
  g.__serverListener ?? new ServerEventHandlerRetrofit();
g.__serverListener ??= serverListener;
