"use client";

import type { State } from "@/types/states";
import { cn } from "@/utils/cn";
import NumberFlow from "@number-flow/react";
import Header from "components/header";
import SlideAnimation from "components/slide-animation";
import { PauseIcon } from "lucide-react";
import { AnimatePresence, motion, NumberMap } from "motion/react";
import { Azeret_Mono } from "next/font/google";
import { type ComponentProps } from "react";
import Gauge from "../gauge";
import MapGauge from "../map-gauge";
import Navball from "../navball";
import SystemStates from "../system-states";

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
};

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
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
  position,
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
                <SlideAnimation>
                  <SystemStates ECU FC />
                </SlideAnimation>
                <SlideAnimation>
                  <Navball
                    pitch={orientation?.pitch}
                    yaw={orientation?.yaw}
                    roll={orientation?.roll}
                  />
                </SlideAnimation>
                <SlideAnimation transition={{ delay: 0.15 }}>
                  <MapGauge
                    lat={position?.lat ?? 0}
                    lng={position?.lon ?? 0}
                    key="map"
                    zoomOverride={altitude > 20 ? 15 : undefined}
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
                <SlideAnimation transition={{ delay: 0.3 }}>
                  <Gauge label="speed" value={Math.round(speed)} unit="km/h" />
                </SlideAnimation>
                <SlideAnimation transition={{ delay: 0.45 }}>
                  <Gauge
                    label="altitude"
                    value={Math.round(altitude)}
                    unit="meters"
                  />
                </SlideAnimation>
                <SlideAnimation transition={{ delay: 0.6 }}>
                  <Gauge label="Accel" value={gForce.toFixed(1)} unit="G" />
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
