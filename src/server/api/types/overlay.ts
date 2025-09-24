import { Clock } from "@/lib/clock/clock";
import type { DecodedData } from "@/lib/telemetry/telemetry-client-retrofit";

export const State = [
  "final-countdown",
  "early-countdown",
  "in-flight",
  "post-flight",
] as const;

export const ClockState = ["hold", "active"] as const;

export type State = (typeof State)[number];
export type ClockState = (typeof ClockState)[number];
export type TelemetryStateData = DecodedData;
export type ClockStateData = {
  time: string;
  state: ClockState;
};
export type OverlayStateData = { state: State };

export class Overlay {
  state: State = "early-countdown";
  clock: Clock = new Clock("T-003000", "hold");
}
