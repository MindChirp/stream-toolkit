"use client";

import { SPONSORS } from "@/lib/telemetry/constants/sponsors";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import BottomTelemetry from "./_components/bottom-telemetry/bottom-telemetry";
import ComputerStates from "./_components/computer-states";
import GoNoGoPolls from "./_components/go-nogo-polls";
import SmallCountdown from "./_components/small-countdown";
import { Roboto_Flex } from "next/font/google";
import CutCornerWrapper from "./_components/cut-corner-wrapper";
import StateTimeline from "./_components/state-timeline";
import { useTimelineIndex } from "@/lib/hooks/useTimelineIndex";
import { useEffect, useState } from "react";
import { FSM_STATES } from "@/lib/telemetry/constants/fsm-states";

const robotoFlex = Roboto_Flex({
  variable: "--font-azeret-mono",
  axes: ["GRAD", "wdth", "slnt"],
  subsets: ["latin"],
});

const OverlayPage = () => {
  // Current state of the UI from websockets
  // Something wrong in this file
  // const state = {};
  const { data: telemetry } = api.socket.onTelemetry.useSubscription();
  const { data: state } = api.socket.onOverlayState.useSubscription();
  const { data: time } = api.socket.onClock.useSubscription();
  const [timelineIndex, setTimelineIndex] = useState(0);

  // const timelineIndex = useTimelineIndex({
  //   fcFsmState: (telemetry?.fc_state as number) ?? 0,
  //   ecuFsmState: (telemetry?.ecu_state as number) ?? 0,
  // });
  useEffect(() => {
    const interval = setInterval(() => {
      setTimelineIndex((prev) => (prev + 1) % FSM_STATES.length);
    }, 1500);

    return () => {
      interval.close();
    };
  }, []);

  return (
    <div className="relative flex h-screen max-h-screen w-full overflow-hidden">
      {/* {(state?.state === "early-countdown" ||
          state?.state === "final-countdown") && (
          <SponsorReel key="sponsor-reel" className="absolute top-52 right-0" />
        )} */}
      {/* <div
          className="absolute top-1/4 left-1/2 flex-col gap-2.5 text-lg"
          key="overlay-debug"
        >
          <h1 className="flex flex-row items-center justify-between gap-5">
            FC State
            <Badge className="text-2xl">
              {JSON.stringify(telemetry?.fc_state)}
            </Badge>
          </h1>

          <h1 className="flex flex-row items-center justify-between gap-5">
            ECU State
            <Badge className="text-2xl">
              {JSON.stringify(telemetry?.ecu_state)}
            </Badge>
          </h1>
        </div> */}

      <AnimatePresence>
        {state?.sponsor.show && state.sponsor.sponsorIndex !== undefined && (
          <motion.div
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
              transition: {
                duration: 1,
                ease: "easeInOut",
                type: "spring",
                stiffness: 100,
                damping: 20,
              },
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 2,
            }}
            className={cn(
              "absolute top-1/2 right-0 -translate-y-1/2 rounded-l-xl rounded-bl-3xl px-10 py-5",
              SPONSORS[state?.sponsor.sponsorIndex]?.bg === "black"
                ? "bg-black/70"
                : "bg-white/70",
            )}
          >
            <Image
              src={`/images/sponsors/${SPONSORS[state.sponsor.sponsorIndex]?.source}`}
              alt="Sponsor"
              className="h-fit w-96 object-cover"
              width={1000}
              height={1000}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* <ComputerStates
          key="computer-states"
          className="top-[24rem] right-full left-0"
        /> */}

      <div
        className="absolute top-[8rem] right-0 flex w-fit flex-col items-end"
        key="right-side-overlay"
      >
        <div className="h-32">
          <AnimatePresence>
            {state?.state == "early-countdown" && (
              <motion.div
                className="relative z-20 h-32 w-fit"
                key="propulse-logo"
                initial={{
                  x: "110%",
                }}
                animate={{
                  x: -10,
                }}
                exit={{
                  x: "110%",
                  transition: {
                    duration: 0.5,
                    delay: 0.5,
                    ease: "easeInOut",
                  },
                }}
                transition={{ duration: 1, ease: "circOut", delay: 0.5 }}
              >
                <Image
                  src="/images/logo-white.png"
                  width={1000}
                  height={1000}
                  className="h-32 w-full object-cover"
                  alt="Mor di"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-5 h-[4.5rem]">
          <AnimatePresence>
            {state?.state === "early-countdown" && (
              <SmallCountdown
                key="small-countdown"
                time={time?.time.slice(2, 8) ?? "TBD"}
                preLaunch={time?.time.slice(0, 2) === "T-" ? true : false}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="mt-5 h-20" key="signoflife-container">
          <AnimatePresence>
            {state?.signOfLife?.show && (
              <ComputerStates
                key="computer-states"
                className="relative z-20 h-fit"
                ecu={Boolean(telemetry?.ecu_active)}
                fc={Boolean(telemetry?.fc_active)}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="relative z-20 mt-5 min-h-[4rem]">
          <AnimatePresence>
            {state?.message.show &&
              (state?.state === "early-countdown" ||
                state?.state == "post-flight") && (
                <motion.div
                  key="overlay-message"
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
                      delay: 0.1,
                      ease: "easeIn",
                    },
                  }}
                  transition={{ duration: 1, ease: "circOut", delay: 1 }}
                  className="lg max-w-96 rounded-tl-lg rounded-bl-3xl text-xl font-normal text-wrap text-white"
                >
                  <CutCornerWrapper
                    cutSize={20}
                    corner="bottomLeft"
                    className="bg-black/80 px-10 py-5"
                  >
                    <span
                      className={cn("text-lg", robotoFlex.className)}
                      style={{
                        fontVariationSettings: `"GRAD" 50, "wdth" 200, "slnt" 0`,
                      }}
                    >
                      {state.message.message}
                    </span>
                  </CutCornerWrapper>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
        <div key="checklist-wrapper" className="mt-5 h-[21rem]">
          <AnimatePresence>
            {state?.goNoGoPolls?.show && (
              <GoNoGoPolls
                state={state.goNoGoPolls.states}
                key="go-no-go-polls"
                className="relative z-20 h-fit"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* {state?.state == "early-countdown" && (
          <motion.div
            className="absolute top-[8rem] right-5 z-20 h-32 w-fit"
            key="propulse-logo"
            initial={{
              x: "110%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "110%",
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
        )} */}
      <AnimatePresence>
        {(state?.state === "early-countdown" ||
          state?.state == "post-flight") &&
          timelineIndex !== undefined && (
            <motion.div
              className="absolute bottom-0 left-1/2 flex h-full w-full -translate-x-1/2 items-end justify-center"
              key="early-timeline"
              initial={{
                bottom: "-10rem",
                opacity: 0,
              }}
              animate={{
                bottom: "0",
                opacity: 1,
              }}
              exit={{
                bottom: "-10rem",
                opacity: 0,
                transition: {
                  duration: 3,
                  ease: "easeInOut",
                  type: "spring",
                },
              }}
              transition={{
                duration: 1,
                ease: "easeInOut",
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 2,
              }}
            >
              <StateTimeline
                className="relative z-20 mb-10"
                timelineIndex={timelineIndex}
                connectingLines
                extraStates
              />
              <div className="absolute bottom-0 left-1/2 h-[20rem] w-[100%] -translate-x-1/2 translate-y-1/2 bg-gradient-to-t from-black to-transparent" />
            </motion.div>
          )}
      </AnimatePresence>
      <AnimatePresence>
        {state?.state &&
          state?.state !== "post-flight" &&
          state?.state !== "early-countdown" && (
            <BottomTelemetry
              message={state.message}
              gForce={
                parseFloat((telemetry?.accelleration as string) ?? 0) / 9.81
              }
              timelineIndex={timelineIndex}
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
              kspNavball={state.kspNavball.show}
              key="bottom-telemetry"
              className="absolute right-0 bottom-0 left-0"
            />
          )}
      </AnimatePresence>
    </div>
  );
};

export default OverlayPage;
