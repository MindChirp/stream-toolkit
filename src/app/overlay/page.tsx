"use client";

import { api } from "@/trpc/react";
import { AnimatePresence } from "motion/react";
import BottomTelemetry from "./_components/bottom-telemetry/bottom-telemetry";
import SponsorReel from "./_components/sponsor-reel";
import StateTimeline from "./_components/state-timeline";
import { useTelemetry } from "@/lib/hooks/useTelemetry";

const OverlayPage = () => {
  // Current state of the UI from websockets
  const telemetry = useTelemetry();
  const { data: state } = api.socket.onOverlayState.useSubscription();
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
            gForce={
              parseFloat((telemetry?.accelleration as string) ?? 0) / 9.81
            }
            speed={telemetry?.velocity as number}
            altitude={telemetry?.altitude as number}
            orientation={{
              pitch: telemetry?.pitch as number,
              yaw: telemetry?.yaw as number,
              roll: telemetry?.roll as number,
            }}
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
    </div>
  );
};

export default OverlayPage;
