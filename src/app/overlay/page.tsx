"use client";

import { api } from "@/trpc/react";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import SponsorReel from "./_components/sponsor-reel";
import BottomTelemetry from "./_components/bottom-telemetry";
import Header from "components/header";
import type { State } from "@/types/states";
import StateTimeline from "./_components/state-timeline";

const OverlayPage = () => {
  // Current state of the UI from websockets
  const { data } = api.socket.onTelemetry.useSubscription();
  const [state, setState] = useState<State>("early-countdown");
  useEffect(() => {
    if (data?.type !== "state") return;
    setState(data.state);
  }, [data]);

  return (
    <div className="flex h-screen w-full">
      <AnimatePresence>
        {state !== "post-flight" && (
          <StateTimeline key="state-timeline" state={state} />
        )}
        {(state === "early-countdown" || state === "final-countdown") && (
          <SponsorReel key="sponsor-reel" className="absolute top-52 right-0" />
        )}
        {state !== "post-flight" && (
          <BottomTelemetry
            state={state}
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
