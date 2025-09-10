"use client";

import { api } from "@/trpc/react";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import SponsorReel from "./_components/sponsor-reel";
import BottomTelemetry from "./_components/bottom-telemetry";
import Header from "components/header";

const OverlayPage = () => {
  // Current state of the UI from websockets
  const { data } = api.socket.onTelemetry.useSubscription();
  const [state, setState] = useState<
    "in-flight" | "final-countdown" | "early-countdown" | "post-flight"
  >("early-countdown");
  useEffect(() => {
    if (data?.type !== "state") return;
    setState(data.state);
  }, [data]);

  return (
    <div className="flex h-screen w-full">
      <Header className="absolute top-0 left-1/2 -translate-x-1/2 text-white">
        {state}
      </Header>
      <AnimatePresence>
        {(state === "early-countdown" || state === "final-countdown") && (
          <SponsorReel key="sponsor-reel" className="absolute top-52 right-0" />
        )}
        {state !== "post-flight" && (
          <BottomTelemetry
            key="bottom-telemetry"
            className="absolute right-0 bottom-0 left-0"
          />
        )}
      </AnimatePresence>
      {JSON.stringify(data)}
    </div>
  );
};

export default OverlayPage;
