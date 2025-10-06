import { on } from "events";
import z from "zod";
import {
  ee,
  overlay as OverlayInstance,
  serverListener as ServerListener,
} from "../singleton";

import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  ClockState,
  State,
  type ClockStateData,
  type OverlayStateData,
} from "../types/overlay";

/**
 * Used for coordinating events, such as when a piece of telemetry is received from the telemetry backend,
 * and it must be broadcast to the stream overlay UI listener.
 */
const OUTGOING_DATA_CHANNELS = {
  TELEMETRY: "telemetry",
  OVERLAY_STATE: "overlay-state",
  CLOCK_STATE: "clock-state",
};
export const UI_DATASOURCE_TARGETS = [
  "altitude",
  "velocity",
  "pitch",
  "yaw",
  "roll",
  "accelleration",
  "lat",
  "lon",
  "fc_active",
  "ecu_active",
  "fc_state",
  "ecu_state",
] as const;

/**
 * Used for managing the overlay state
 */
if (!("__clockHooked" in globalThis)) {
  OverlayInstance.clock.timeTickCallback((time) => {
    ee.emit(OUTGOING_DATA_CHANNELS.CLOCK_STATE, {
      time,
      state: OverlayInstance.clock.getState(),
    } as ClockStateData);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (globalThis as any).__clockHooked = true;
}

/**
 * Used for listening to UDP/SSE data streaming in from the telemetry backend.
 */

/**
 * The realtime tRPC router responsible for handling realtime communications.
 */
export const realtimeRouterRevamped = createTRPCRouter({
  /**
   * Subscriber methods
   */
  onTelemetry: publicProcedure.subscription(async function* (opts) {
    // Yield an initial telemetry state
    // yield {
    //   // We do not have any initial telemetry data. Silly me.
    // } as TelemetryStateData;

    for await (const [data] of on(ee, OUTGOING_DATA_CHANNELS.TELEMETRY, {
      signal: opts.signal,
    })) {
      const item = data as Record<
        (typeof UI_DATASOURCE_TARGETS)[number],
        unknown
      >;
      yield item;
    }
  }),

  onClock: publicProcedure.subscription(async function* (opts) {
    // Yield an initial clock state
    yield {
      time: OverlayInstance.clock.getTime(),
      state: OverlayInstance.clock.getState(),
    } as ClockStateData;

    for await (const [data] of on(ee, OUTGOING_DATA_CHANNELS.CLOCK_STATE, {
      signal: opts.signal,
    })) {
      const item = data as ClockStateData;
      yield item;
    }
  }),

  onOverlayState: publicProcedure.subscription(async function* (opts) {
    // Yield an initial overlay state.
    yield {
      ...OverlayInstance.getState(),
    } as OverlayStateData;

    for await (const [data] of on(ee, OUTGOING_DATA_CHANNELS.OVERLAY_STATE, {
      signal: opts.signal,
    })) {
      const item = data as OverlayStateData;
      yield item;
    }
  }),

  /**
   * Mutation methods
   */

  /**
   * Overrides the currently active overlay state.
   */
  setOverlayState: publicProcedure
    .input(
      z.object(
        {
          state: z.enum(State).optional(),
          goNoGoPolls: z
            .object({
              show: z.boolean().optional(),
              states: z.object({
                range: z.boolean().optional().nullable(),
                propulsion: z.boolean().optional().nullable(),
                weather: z.boolean().optional().nullable(),
                gse: z.boolean().optional().nullable(),
              }),
            })
            .optional(),
          message: z
            .object({
              show: z.boolean().optional(),
              message: z.string().optional().nullable(),
            })
            .optional(),
        },
        {
          description: `Sets the overlay state. The state sent to this endpoint will immideately be reflected in the stream overlay UI.`,
        },
      ),
    )
    .mutation(({ input }) => {
      if (input.state) {
        OverlayInstance.setOverlayState(input.state);
      }

      if (input.goNoGoPolls) {
        OverlayInstance.setGoNoGoPollState(input.goNoGoPolls);
      }

      if (input.message) {
        OverlayInstance.setMessageState(input.message);
      }

      // Emit event to listeners
      ee.emit(OUTGOING_DATA_CHANNELS.OVERLAY_STATE, {
        state: OverlayInstance.getState().state,
        goNoGoPolls: OverlayInstance.getState().goNoGoPolls,
        message: OverlayInstance.getState().message,
      } satisfies OverlayStateData);
    }),

  /**
   * Sets the current clock state. Through this endpoint, the clock can be paused, started, and the
   * time can be adjusted manually.
   */
  setClockState: publicProcedure
    .input(
      z.object(
        {
          time: z
            .string()
            .regex(/^T[-+][0-9]+$/i, "Time must be in T-HHMMSS format"),
          state: z.enum(ClockState),
        },
        {
          description: `Sets the clock state. The endpoint can be used no matter if the clock is currently running, or if it is in hold mode. Data sent to this endpoint
        will immedeately be reflected in the stream overlay UI.`,
        },
      ),
    )
    .mutation(({ input }) => {
      OverlayInstance.clock.setTime(input.time);
      if (input.state === "active") {
        OverlayInstance.clock.start();
      } else if (input.state === "hold") {
        OverlayInstance.clock.stop();
      }

      // Notify listeners
      ee.emit(OUTGOING_DATA_CHANNELS.CLOCK_STATE, {
        state: OverlayInstance.clock.getState(),
        time: OverlayInstance.clock.getTime(),
      } satisfies ClockStateData);
    }),

  getTelemetrySources: publicProcedure.query(() => {
    // Get all telemetry sources
    const sources = ServerListener.getSources();

    // Map the sources to a more appropriate format
    const data = sources.map((s) => ({
      host: s.socket.address().address,
      port: s.socket.address().port,
      mappings: s.uiDataMap,
    }));

    return data;
  }),

  /**
   * Sets up a telemetry source connection by port and host.
   */
  setupTelemetrySource: publicProcedure
    .input(
      z.object({
        host: z.string().ip(),
        port: z.number(),
        telemetryUIMap: z.array(
          z.object({
            rawName: z.string(),
            uiTarget: z.enum(UI_DATASOURCE_TARGETS),
          }),
          {
            description: `The map used to define the connection between rocket telemetry values, and the actual
               stream overlay UI. For instance, values corresponding to 'kalman_velocity' 
               should be mapped to 'velocity'. Without this mapping, the stream overlay is unable to show realtime
               telemetry information.`,
          },
        ),
        signOfLife: z.enum(["ecu", "fc"]).optional(),
      }),
    )
    .mutation(({ input }) => {
      // Create a telemetry source

      const socket = ServerListener.addSource(
        input.host,
        input.port,
        input.telemetryUIMap.map((i) => ({
          from: i.rawName,
          uiTarget: i.uiTarget,
        })),
        input.signOfLife,
      );

      socket.onMessage((data) => {
        // Update the telemetry object within the overlay
        OverlayInstance.patchTelemetry(data.uiMappedTelemetry);

        ee.emit("telemetry", OverlayInstance.getTelemetry());
      });

      return;
    }),

  deleteTelemetrySource: publicProcedure
    .input(z.object({ host: z.string(), port: z.number() }))
    .mutation(({ input }) => {
      ServerListener.removeSource(input.host, input.port);

      return;
    }),
});
