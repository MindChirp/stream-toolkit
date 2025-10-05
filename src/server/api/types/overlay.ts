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
export type OverlayStateData = {
  state: State;
  goNoGoPolls?: {
    show: boolean;
    states: {
      range?: boolean | null;
      propulsion?: boolean | null;
      weather?: boolean | null;
      gse?: boolean | null;
    };
  };
  message?: {
    show: boolean;
    message?: string | null;
  };
};

export class Overlay {
  #state: {
    state: State;
    goNoGoPolls: NonNullable<OverlayStateData["goNoGoPolls"]>;
    message: NonNullable<OverlayStateData["message"]>;
  } = {
    state: "early-countdown",
    goNoGoPolls: {
      show: false,
      states: {
        gse: null,
        propulsion: null,
        range: null,
        weather: null,
      },
    },
    message: {
      show: false,
      message: undefined,
    },
  };
  clock: Clock = new Clock("T-003000", "hold");

  setOverlayState(state: State) {
    this.#state.state = state;
  }

  setGoNoGoPollState(state: {
    show?: boolean;
    states: NonNullable<OverlayStateData["goNoGoPolls"]>["states"];
  }) {
    // Go through each state, and only override the value if it is anything other
    // than undefined
    if (state?.states) {
      Object.entries(state?.states).forEach((s) => {
        const key = s[0] as keyof NonNullable<
          OverlayStateData["goNoGoPolls"]
        >["states"];
        if (s[1] !== undefined) {
          this.#state.goNoGoPolls.states[key] = s[1];
        }
      });
    }

    if (state?.show != undefined) this.#state.goNoGoPolls.show = state.show;
  }

  setMessageState(state: { show?: boolean; message?: string | null }) {
    this.#state.message.show = state.show ?? this.#state.message.show;
    this.#state.message.message = state.message ?? this.#state.message.message;
  }

  getState() {
    return this.#state;
  }
}
