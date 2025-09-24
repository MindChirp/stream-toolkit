import { Clock as ClockClass } from "@/lib/clock/clock";
import { ServerEventHandlerRetrofit } from "@/lib/telemetry/telemetry-client-retrofit";
import EventEmitter, { on } from "events";
import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const STATE_VALUES = [
  "final-countdown",
  "early-countdown",
  "in-flight",
  "post-flight",
] as const;

const CLOCK_STATE_VALUES = ["hold", "active"] as const;

type Telemetry = Record<string, unknown>;
type Clock = { time: string; state: (typeof CLOCK_STATE_VALUES)[number] };
type OverlayState = { state: (typeof STATE_VALUES)[number] };

const ee = new EventEmitter();

const ClockInstance = new ClockClass("T-003000", "hold");

const ServerEventListenerInstance = new ServerEventHandlerRetrofit();

// Set the timer callback
ClockInstance.timeTickCallback((time) => {
  ee.emit("clock-state", {
    time,
    state: ClockInstance.getState(),
  } as Clock);

  // Modifies overlay state based on remaining time in countdown
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
    // Send an initial state
    ee.emit("overlay-state", {} as OverlayState);
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

      if (input.state === "active") {
        ClockInstance.start();
      } else {
        ClockInstance.stop();
      }

      ee.emit("clock-state", {
        ...input,
      } as Clock);
    }),
  addTelemetrySource: publicProcedure
    .input(
      z.object({
        source: z.string().min(1, "Source must be defined"),
        data_keys: z.array(
          z.object({
            key: z.string(),
            target: z.enum([
              "altitude",
              "velocity",
              "acceleration",
              "pitch",
              "yaw",
              "roll",
              "custom",
            ]),
          }),
        ),
      }),
    )
    .mutation(({ input }) => {
      try {
        console.log("Setting telemetry source to:", input.source);
        const socket = ServerEventListenerInstance.addSource(input.source);
        socket.socket.on("message", (msg) => {
          const data = socket.decode(msg);
          console.log("Received telemetry data:", data);
          ee.emit("telemetry", data);
        });
      } catch (e) {
        console.error("Failed to set telemetry source:", e);
        throw e;
      }

      return;
    }),
  getCurrentOverlayState: publicProcedure.query(() => {
    // When the overlay first connects, send the current state
  }),
});
