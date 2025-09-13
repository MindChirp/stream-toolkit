"use client";

import { api } from "@/trpc/react";
import { AnimatePresence } from "motion/react";
import BottomTelemetry from "./_components/bottom-telemetry/bottom-telemetry";
import SponsorReel from "./_components/sponsor-reel";
import StateTimeline from "./_components/state-timeline";

const OverlayPage = () => {
  // Current state of the UI from websockets
  const { data: state } = api.socket.onOverlayState.useSubscription();
  const { data: telemetry } = api.socket.onTelemetry.useSubscription();
  const { data: time } = api.socket.onClock.useSubscription();

  return (
    <div className="flex h-screen max-h-screen w-full overflow-hidden">
      <AnimatePresence>
        {state?.state && state?.state !== "post-flight" && (
          <StateTimeline key="state-timeline" state={state.state} />
        )}
        {(state?.state === "early-countdown" ||
          state?.state === "final-countdown") && (
          <SponsorReel key="sponsor-reel" className="absolute top-52 right-0" />
        )}

        {state?.state && state?.state !== "post-flight" && (
          <BottomTelemetry
            clockState={{
              time: time?.time ?? "TBD",
              state: time?.state ?? "hold",
            }}
            overlayState={state.state}
            key="bottom-telemetry"
            className="absolute right-0 bottom-0 left-0"
          />
        )}
      </AnimatePresence>
      {/* {JSON.stringify(data)} */}
    </div>
  );
};

export default OverlayPage;
