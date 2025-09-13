import EventEmitter, { on } from "events";
import { createTRPCRouter, publicProcedure } from "../trpc";
import z from "zod";
import { Clock as ClockClass } from "@/lib/clock/clock";
import { ServerEventHandler } from "@/lib/serverevents/serverevents";

const STATE_VALUES = [
  "final-countdown",
  "early-countdown",
  "in-flight",
  "post-flight",
] as const;

const CLOCK_STATE_VALUES = ["hold", "active"] as const;

type Telemetry = { data: object };
type Clock = { time: string; state: (typeof CLOCK_STATE_VALUES)[number] };
type OverlayState = { state: (typeof STATE_VALUES)[number] };

const ee = new EventEmitter();

const ClockInstance = new ClockClass("T-003000", "hold");

const ServerEventListenerInstance = new ServerEventHandler();

// Set the timer callback
ClockInstance.timeTickCallback((time) => {
  ee.emit("clock-state", {
    time,
    state: ClockInstance.getState(),
  } as Clock);

  if (ClockInstance.getRawTime() >= -7 && ClockInstance.getRawTime() <= -3) {
    ee.emit("overlay-state", {
      state: "final-countdown",
    } as OverlayState);
  } else if (
    ClockInstance.getRawTime() > -3 &&
    ClockInstance.getRawTime() <= 0
  ) {
    ee.emit("overlay-state", {
      state: "in-flight",
    } as OverlayState);
  }
});

const telemetryCallback = (data: unknown) => {
  console.log("Received data: ", data);
};

// Set up an interval to trigger the event emitter every other second
setInterval(() => {
  const data: Telemetry = {
    data: {
      title: "Test",
      description: new Date().toISOString(),
    },
  };
  ee.emit("telemetry", data);
}, 2000);

export const realtimeRouter = createTRPCRouter({
  onTelemetry: publicProcedure.subscription(async function* (opts) {
    for await (const [data] of on(ee, "telemetry", {
      signal: opts.signal,
    })) {
      const item = data as Telemetry;
      yield item;
    }
  }),
  onOverlayState: publicProcedure.subscription(async function* (opts) {
    for await (const [data] of on(ee, "overlay-state", {
      signal: opts.signal,
    })) {
      const item = data as OverlayState;
      yield item;
    }
  }),
  onClock: publicProcedure.subscription(async function* (opts) {
    for await (const [data] of on(ee, "clock-state", {
      signal: opts.signal,
    })) {
      const item = data as Clock;
      yield item;
    }
  }),

  setOverlayMode: publicProcedure
    .input(
      z.object({
        mode: z.enum(STATE_VALUES),
      }),
    )
    .mutation(({ input }) => {
      console.log("Setting overlay mode to:", input.mode);

      ee.emit("overlay-state", {
        state: input.mode,
      } as OverlayState);

      return;
    }),
  setClock: publicProcedure
    .input(
      z.object({
        time: z
          .string()
          .regex(/^T[-+][0-9]+$/i, "Time must be in T-HHMMSS format"),
        state: z.enum(CLOCK_STATE_VALUES),
      }),
    )
    .mutation(({ input }) => {
      console.log("Setting clock to:", input.time, "with state:", input.state);
      ClockInstance.setTime(input.time);

      console.log("State: " + input.state);
      if (input.state === "active") {
        ClockInstance.start();
      } else {
        ClockInstance.stop();
      }

      ee.emit("clock-state", {
        ...input,
      } as Clock);
    }),
  setTelemetrySource: publicProcedure
    .input(
      z.object({
        source: z.string().min(1, "Source must be defined"),
      }),
    )
    .mutation(({ input }) => {
      try {
        console.log("Setting telemetry source to:", input.source);
        ServerEventListenerInstance.setSource(input.source);
        ServerEventListenerInstance.onMessage(telemetryCallback);
      } catch (e) {
        console.error("Failed to set telemetry source:", e);
        throw e;
      }

      return;
    }),
});
