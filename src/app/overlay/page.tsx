"use client";

import { api } from "@/trpc/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import BottomTelemetry from "./_components/bottom-telemetry/bottom-telemetry";
import ComputerStates from "./_components/computer-states";
import GoNoGoPolls from "./_components/go-nogo-polls";
import SmallCountdown from "./_components/small-countdown";
import StateTimeline from "./_components/state-timeline";

const OverlayPage = () => {
  // Current state of the UI from websockets
  // Something wrong in this file
  // const state = {};
  const { data: telemetry } = api.socket.onTelemetry.useSubscription();
  const { data: state } = api.socket.onOverlayState.useSubscription();
  const { data: time } = api.socket.onClock.useSubscription();

  return (
    <div className="relative flex h-screen max-h-screen w-full overflow-hidden">
      <AnimatePresence>
        {state?.state && state?.state !== "post-flight" && (
          <StateTimeline key="state-timeline" state={state.state} />
        )}
        {/* {(state?.state === "early-countdown" ||
          state?.state === "final-countdown") && (
          <SponsorReel key="sponsor-reel" className="absolute top-52 right-0" />
        )} */}
        {/* <h1 className="absolute top-1/2 left-1/2 text-black">
          {JSON.stringify(telemetry?.fc_active, null, "\t")}
        </h1> */}

        {state?.state === "early-countdown" && (
          <SmallCountdown
            className="top-[19rem]"
            key="small-countdown"
            time={time?.time.slice(2, 8) ?? "TBD"}
            preLaunch={time?.time.slice(0, 2) === "T-" ? true : false}
          />
        )}

        {state?.goNoGoPolls?.show && (
          <GoNoGoPolls state={state.goNoGoPolls.states} key="go-no-go-polls" />
        )}

        <ComputerStates
          key="computer-states"
          className="top-[24rem]"
          ecu={Boolean(telemetry?.ecu_active)}
          fc={Boolean(telemetry?.fc_active)}
        />

        {/* <ComputerStates
          key="computer-states"
          className="top-[24rem] right-full left-0"
        /> */}

        {state?.state == "early-countdown" && (
          <motion.div
            className="absolute top-[8rem] right-5 z-20 h-32 w-fit"
            key="propulse-logo"
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
              transition: {
                duration: 0.5,
                delay: 0.5,
                ease: "easeIn",
              },
            }}
            transition={{ duration: 1, ease: "circOut", delay: 0.5 }}
          >
            <Image
              src="/images/logo-white.png"
              width={1000}
              height={1000}
              className="h-full w-full object-cover"
              alt="Mor di"
            />
          </motion.div>
        )}
        {state?.state &&
          state?.state !== "post-flight" &&
          state?.state !== "early-countdown" && (
            <BottomTelemetry
              message={state.message}
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
