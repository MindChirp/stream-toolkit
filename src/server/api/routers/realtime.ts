import EventEmitter, { on } from "events";
import { createTRPCRouter, publicProcedure } from "../trpc";
import z from "zod";
const STATE_VALUES = [
  "final-countdown",
  "early-countdown",
  "in-flight",
  "post-flight",
] as const;

type Test = {
  type: "state" | "telemetry";
} & (
  | { type: "state"; state: (typeof STATE_VALUES)[number] }
  | { type: "telemetry"; data: object }
);

const ee = new EventEmitter();

// Set up an interval to trigger the event emitter every other second
setInterval(() => {
  const data: Test = {
    type: "telemetry",
    data: {
      title: "Test",
      description: new Date().toISOString(),
    },
  };
  ee.emit("data", data);
}, 2000);

export const realtimeRouter = createTRPCRouter({
  onTelemetry: publicProcedure.subscription(async function* (opts) {
    for await (const [data] of on(ee, "data", {
      signal: opts.signal,
    })) {
      const item = data as Test;
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

      ee.emit("data", {
        type: "state",
        state: input.mode,
      } as Test);

      return;
    }),
});
