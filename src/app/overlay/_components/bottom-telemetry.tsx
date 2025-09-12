"use client";
import type { State } from "@/types/states";
import { cn } from "@/utils/cn";
import Header from "components/header";
import { AnimatePresence, motion } from "motion/react";
import { type ComponentProps } from "react";
import Gauge from "./gauge";
import MapGauge from "./map-gauge";
import Navball from "./navball";
import SlideAnimation from "components/slide-animation";

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
      <div className="flex h-56 w-full flex-row items-center justify-evenly">
        <div className="flex w-full flex-row gap-10" key="telemetry-wrapper">
          <AnimatePresence>
            {(state === "in-flight" || state === "final-countdown") && (
              <motion.div
                key="left-telemetry"
                className="flex w-full flex-row justify-end gap-10 pr-10"
              >
                <SlideAnimation>
                  <Navball />
                </SlideAnimation>
                <SlideAnimation transition={{ delay: 0.15 }}>
                  <MapGauge lat={63.786841} lng={9.363121} key="map" />
                </SlideAnimation>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Header
          key="countdown"
          className="font-poppins! min-w-fit px-20 text-center tracking-wide text-white"
        >
          T-00:30:00
        </Header>
        <div
          key="right-telemetry-wrapper"
          className="flex w-full flex-row gap-10"
        >
          <AnimatePresence>
            {(state === "in-flight" || state === "final-countdown") && (
              <motion.div
                key="right-telemetry"
                className="flex w-full flex-row justify-start gap-10 pl-10"
              >
                <SlideAnimation transition={{ delay: 0.3 }}>
                  <Gauge label="speed" value={4000} unit="km/h" />
                </SlideAnimation>
                <SlideAnimation transition={{ delay: 0.45 }}>
                  <Gauge label="altitude" value={5000} unit="meters" />
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
