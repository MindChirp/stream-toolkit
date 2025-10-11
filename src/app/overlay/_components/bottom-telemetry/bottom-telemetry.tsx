"use client";

import type { State } from "@/types/states";
import { cn } from "@/utils/cn";
import NumberFlow from "@number-flow/react";
import Header from "components/header";
import SlideAnimation from "components/slide-animation";
import { PauseIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Azeret_Mono, Roboto_Flex } from "next/font/google";
import Image from "next/image";
import { type ComponentProps } from "react";
import Gauge from "../gauge";
import MapGauge from "../map-gauge";
import Navball from "../navball";
import StateTimeline from "../state-timeline";

type BottomTelemetryProps = ComponentProps<typeof motion.div> & {
  timestamp?: string;
  overlayState: State;
  altitude?: number;
  speed?: number;
  gForce?: number;
  position?: {
    lat?: number;
    lon?: number;
  };
  orientation?: {
    pitch?: number;
    yaw?: number;
    roll?: number;
  };
  clockState: {
    time: string;
    state: "hold" | "active";
  };
  message?: {
    show: boolean;
    message?: string | null;
  };
  fcFsmState?: number;
  ecuFsmState?: number;
};

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"],
});

const robotoFlex = Roboto_Flex({
  variable: "--font-azeret-mono",
  axes: ["GRAD", "wdth", "slnt"],
  subsets: ["latin"],
});

const BottomTelemetry = ({
  speed = 0,
  altitude = 0,
  gForce = 1,
  orientation,
  className,
  overlayState,
  clockState,
  message,
  position,
  fcFsmState,
  ecuFsmState,
  ...props
}: BottomTelemetryProps) => {
  return (
    <motion.div
      key="bottom-telemetry"
      initial={{
        opacity: 0,
        transform: "translateY(100%)",
      }}
      animate={{
        opacity: 1,
        transform: "translateY(0%)",
      }}
      transition={{
        // delay: 0.5,
        duration: 3,
        type: "decay",
        ease: "anticipate",
      }}
      exit={{
        opacity: 0,
        height: 0,
        transform: "translateY(50%)",
        transition: {
          ease: "easeIn",
          duration: 1,
          delay: 1,
        },
      }}
      className={cn(
        "flex h-96 items-end justify-center overflow-hidden bg-gradient-to-t from-black to-transparent",
        className,
      )}
      {...props}
    >
      <div className="flex h-56 w-full flex-row items-center justify-evenly">
        <div className="flex w-full flex-row gap-10" key="telemetry-wrapper">
          <AnimatePresence>
            {(overlayState === "in-flight" ||
              overlayState === "final-countdown") && (
              <motion.div
                key="left-telemetry"
                className="flex w-full flex-row justify-end gap-10 pr-10"
              >
                <SlideAnimation
                  transition={{
                    delay: 2,
                  }}
                  className="flex items-center"
                >
                  <Image
                    src="/images/logo-white.png"
                    width={1000}
                    height={1000}
                    alt="Logo"
                    className="h-fit w-52"
                  />
                  {/* <SystemStates ECU FC /> */}
                </SlideAnimation>
                <SlideAnimation
                  transition={{
                    delay: 2.15,
                  }}
                >
                  <Navball
                    pitch={orientation?.pitch}
                    yaw={orientation?.yaw}
                    roll={orientation?.roll}
                  />
                </SlideAnimation>
                <SlideAnimation transition={{ delay: 2.3 }}>
                  <MapGauge
                    lat={position?.lat ?? 63.786877}
                    lng={position?.lon ?? 9.363318}
                    key="map"
                    zoomOverride={altitude > 20 ? 12 : undefined}
                  />
                </SlideAnimation>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mx-20 w-fit">
          <AnimatePresence>
            {clockState.state === "hold" && (
              <motion.span
                key="hold-icon"
                className="absolute top-1/2 -left-3 flex size-10 -translate-x-full -translate-y-1/2 items-center justify-center rounded-full bg-black/50"
                initial={{
                  opacity: 0,
                  translateY: 10,
                }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
              >
                <PauseIcon
                  strokeWidth={1}
                  color="white"
                  stroke="transparent"
                  fill="white"
                  className="opacity-70"
                  size={20}
                />
              </motion.span>
            )}
          </AnimatePresence>

          <div className="flex flex-col">
            <AnimatePresence>
              {message?.show && (
                <motion.span
                  key="message-box"
                  initial={{
                    y: 10,
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: 10,
                    opacity: 0,
                  }}
                  className={cn(
                    "absolute -top-0 left-1/2 w-96 -translate-x-1/2 -translate-y-full flex-row gap-5 rounded-lg bg-black/90 px-5 py-2.5 text-center text-xl font-normal text-white",
                    robotoFlex.className,
                  )}
                  style={{
                    fontVariationSettings: `"GRAD" 50, "wdth" 200, "slnt" 0`,
                  }}
                >
                  {message.message}
                </motion.span>
              )}
            </AnimatePresence>
            <Header
              key="countdown"
              className={cn(
                `${azeretMono.className} relative w-fit font-normal tracking-tighter whitespace-nowrap text-white`,
              )}
            >
              {/* {clockState.time} */}
              {clockState.time.slice(0, 2)}
              <NumberFlow value={parseInt(clockState.time.slice(2, 3))} />
              <NumberFlow value={parseInt(clockState.time.slice(3, 4))} />
              :
              <NumberFlow value={parseInt(clockState.time.slice(4, 5))} />
              <NumberFlow value={parseInt(clockState.time.slice(5, 6))} />
              :
              <NumberFlow value={parseInt(clockState.time.slice(6, 7))} />
              <NumberFlow value={parseInt(clockState.time.slice(7, 8))} />
            </Header>
            <AnimatePresence>
              <StateTimeline ecu_state={ecuFsmState} fc_state={fcFsmState} />
            </AnimatePresence>
          </div>
        </div>
        <div
          key="right-telemetry-wrapper"
          className="flex w-full flex-row gap-10"
        >
          <AnimatePresence>
            {(overlayState === "in-flight" ||
              overlayState === "final-countdown") && (
              <motion.div
                key="right-telemetry"
                className="flex w-full flex-row justify-start gap-10 pl-10"
              >
                <SlideAnimation transition={{ delay: 2.45 }}>
                  <Gauge
                    label="speed"
                    value={Math.abs(speed).toFixed(0)}
                    unit="m/s"
                  />
                </SlideAnimation>
                <SlideAnimation transition={{ delay: 2.6 }}>
                  <Gauge
                    label="altitude"
                    value={Math.round(altitude)}
                    unit="meters"
                  />
                </SlideAnimation>
                <SlideAnimation transition={{ delay: 2.75 }}>
                  <Gauge
                    label="Accel"
                    value={Math.abs(gForce).toFixed(1)}
                    unit="G"
                  />
                </SlideAnimation>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default BottomTelemetry;
