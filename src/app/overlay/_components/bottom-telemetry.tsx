"use client";
import React, { type ComponentProps } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/utils/cn";
import Header from "components/header";
import Navball from "./navball";
import type { State } from "@/types/states";
import SpeedGauge from "./gauge";
import Gauge from "./gauge";
import MapGauge from "./map-gauge";

type BottomTelemetryProps = ComponentProps<typeof motion.div> & {
  state: State;
};
const BottomTelemetry = ({
  className,
  state,
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
      <div className="flex h-56 w-full flex-row items-center justify-center justify-evenly">
        <AnimatePresence>
          <div className="flex flex-row gap-10">
            {(state === "in-flight" || state === "final-countdown") && (
              <motion.div
                key="navball"
                initial={{
                  opacity: 0,
                  transform: "translateY(100%)",
                }}
                animate={{
                  opacity: 1,
                  transform: "translateY(0%)",
                }}
                transition={{
                  duration: 2,
                  type: "decay",
                  ease: "anticipate",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transform: "translateY(50%)",
                }}
              >
                <Navball />
              </motion.div>
            )}

            <MapGauge lat={63.786841} lng={9.363121} key="map" />
          </div>
        </AnimatePresence>
        <Header className="font-poppins! text-center tracking-wide text-white">
          T-00:30:00
        </Header>
        <div className="flex flex-row gap-10">
          <Gauge label="speed" value={4000} unit="km/h" />
          <Gauge label="altitude" value={5000} unit="meters" />
        </div>
      </div>
    </motion.div>
  );
};

export default BottomTelemetry;
