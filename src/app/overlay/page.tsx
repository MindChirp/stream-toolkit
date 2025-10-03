"use client";

import { useTelemetry } from "@/lib/hooks/useTelemetry";
import { api } from "@/trpc/react";
import { AnimatePresence } from "motion/react";
import BottomTelemetry from "./_components/bottom-telemetry/bottom-telemetry";
import SmallCountdown from "./_components/small-countdown";
import StateTimeline from "./_components/state-timeline";

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
        {/* {(state?.state === "early-countdown" ||
          state?.state === "final-countdown") && (
          <SponsorReel key="sponsor-reel" className="absolute top-52 right-0" />
        )} */}

        {state?.state === "early-countdown" && (
          <SmallCountdown
            time={time?.time.slice(2, 8) ?? "TBD"}
            preLaunch={time?.time.slice(0, 2) === "T-" ? true : false}
          />
        )}

        {state?.state &&
          state?.state !== "post-flight" &&
          state?.state !== "early-countdown" && (
            <BottomTelemetry
              gForce={
                parseFloat((telemetry?.accelleration as string) ?? 0) / 9.81
              }
              position={{
                lat: telemetry?.lat as number,
                lon: telemetry?.lon as number,
              }}
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
