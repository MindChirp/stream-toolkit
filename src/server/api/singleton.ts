import { ServerEventHandlerHeimdall } from "@/lib/telemetry/telemetry-client-heimdall";
import EventEmitter from "events";
import { Overlay } from "./types/overlay";
import { ServerEventHandlerRetrofit } from "@/lib/telemetry/telemetry-client-retrofit";

enum Rocket {
  HEIMDALL,
  BIFROST,
}

// eslint-disable-next-line prefer-const
let adapter: Rocket = Rocket.HEIMDALL;

const handler =
  // // @ts-expect-error: intentional runtime-only branch
  adapter === Rocket.HEIMDALL
    ? new ServerEventHandlerHeimdall()
    : new ServerEventHandlerRetrofit();

const g = globalThis as {
  __ee?: EventEmitter;
  __overlay?: Overlay;
  __serverListener?: typeof handler;
};

export const ee: EventEmitter = g.__ee ?? new EventEmitter();

if (!g.__ee) {
  g.__ee = ee;

  ee.setMaxListeners(1000);
}

export const overlay: Overlay = g.__overlay ?? new Overlay();
g.__overlay ??= overlay;

export const serverListener: typeof handler = g.__serverListener ?? handler;
g.__serverListener ??= serverListener;
