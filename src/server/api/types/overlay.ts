import { Clock } from "@/lib/clock/clock";
import { type UI_DATASOURCE_TARGETS } from "@/lib/telemetry/constants/ui-targets";

export const State = [
  "final-countdown",
  "early-countdown",
  "in-flight",
  "post-flight",
] as const;

export const ClockState = ["hold", "active"] as const;

export type State = (typeof State)[number];
export type ClockState = (typeof ClockState)[number];
export type PollState = "go" | "nogo" | "tbd";
export type ClockStateData = {
  time: string;
  state: ClockState;
};
export type OverlayStateData = {
  state: State;
  goNoGoPolls: {
    show: boolean;
    states: {
      propulsion: PollState;
      recovery: PollState;
      range: PollState;
      pad: PollState;
      telemetry: PollState;
      trajectory: PollState;
      pyro: PollState;
      operations: PollState;
    };
  };
  signOfLife: { show: boolean };
  message: {
    show: boolean;
    message?: string | null;
  };
  sponsor: {
    show: boolean;
    sponsorIndex: number;
  };
  kspNavball: {
    show: boolean;
  };
};

export class Overlay {
  #state: OverlayStateData = {
    state: "early-countdown",
    signOfLife: { show: true },
    goNoGoPolls: {
      show: false,
      states: {
        operations: "tbd",
        pad: "tbd",
        propulsion: "tbd",
        pyro: "tbd",
        range: "tbd",
        recovery: "tbd",
        telemetry: "tbd",
        trajectory: "tbd",
      },
    },
    message: {
      show: false,
      message: undefined,
    },
    sponsor: {
      show: false,
      sponsorIndex: 0,
    },
    kspNavball: { show: false },
  };

  stateCheckpoint: OverlayStateData | undefined = undefined;

  #telemetry: Record<(typeof UI_DATASOURCE_TARGETS)[number], unknown> = {
    accelleration: 0,
    altitude: 0,
    ecu_active: 0,
    ecu_state: undefined,
    fc_active: 0,
    fc_state: undefined,
    lat: 0,
    lon: 0,
    pitch: 0,
    roll: 0,
    velocity: 0,
    yaw: 0,
  };

  clock: Clock = new Clock("T-003000", "hold");

  setOverlayState(state: State) {
    this.#state.state = state;
  }

  setGoNoGoPollState(state: {
    show?: boolean;
    states: Partial<NonNullable<OverlayStateData["goNoGoPolls"]>["states"]>;
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

  setSignOfLifeState(state: { show: boolean }) {
    this.#state.signOfLife.show = state.show;
  }

  setKSPNavballState(state: { show: boolean }) {
    this.#state.kspNavball.show = state.show;
  }

  setSponsorState(state: Partial<OverlayStateData["sponsor"]>) {
    if (state.show !== undefined) {
      this.#state.sponsor.show = state.show;
    }

    if (state.sponsorIndex !== undefined) {
      this.#state.sponsor.sponsorIndex = state.sponsorIndex;
    }
  }

  patchTelemetry(
    telemetry: Record<(typeof UI_DATASOURCE_TARGETS)[number], unknown>,
  ) {
    for (const key in telemetry) {
      const typedKey = key as (typeof UI_DATASOURCE_TARGETS)[number];

      if (telemetry[typedKey] === undefined) continue;
      // if (typedKey === "ecu_active")
      //   console.log("ECU STATE SET: ", telemetry[typedKey]);
      this.#telemetry[typedKey] = telemetry[typedKey];
    }
  }

  createOverlayStateCheckpoint() {
    // Copy over overlay state to checkpoint property
    this.stateCheckpoint = JSON.parse(
      JSON.stringify(this.#state),
    ) as OverlayStateData;
  }

  restoreOverlayStateCheckpoint() {
    console.log("State checkpoint", this.stateCheckpoint);
    if (this.stateCheckpoint === undefined) return;
    this.#state = JSON.parse(
      JSON.stringify({
        ...this.#state,
        goNoGoPolls: {
          ...this.#state.goNoGoPolls,
          show: this.stateCheckpoint.goNoGoPolls.show,
        },
        message: {
          ...this.#state.message,
          show: this.stateCheckpoint.message.show,
        },
        signOfLife: {
          ...this.#state.signOfLife,
          show: this.stateCheckpoint.signOfLife.show,
        },
        sponsor: {
          ...this.#state.sponsor,
          show: this.stateCheckpoint.sponsor.show,
        },
        state: this.stateCheckpoint.state,
      }),
    ) as OverlayStateData;
  }

  getTelemetry() {
    return this.#telemetry;
  }

  getState() {
    return this.#state;
  }
}
