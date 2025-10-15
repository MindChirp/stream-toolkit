import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Roboto_Flex } from "next/font/google";
import { type ComponentProps } from "react";

const robotoFlex = Roboto_Flex({
  variable: "--font-azeret-mono",
  axes: ["GRAD", "wdth", "slnt"],
  subsets: ["latin"],
});

type ComputerStatesProps = {
  ecu?: boolean;
  fc?: boolean;
} & ComponentProps<typeof motion.div>;
const ComputerStates = ({ ecu, fc, className }: ComputerStatesProps) => {
  return (
    <motion.div
      key="small-clock-wrapper"
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
      transition={{ duration: 1, ease: "circOut" }}
      className={cn("z-20 w-fit", robotoFlex.className, className)}
    >
      <CutCornerWrapper className="flex flex-col bg-black/80 px-16 py-2 leading-none font-semibold text-white">
        <span className="flex flex-row items-center justify-between gap-2.5 text-2xl">
          ECU <IndicatorCircle active={ecu} />
        </span>
        <span className="flex flex-row items-center justify-between gap-2.5 text-2xl">
          FC <IndicatorCircle active={fc} />
        </span>
      </CutCornerWrapper>
    </motion.div>
  );
};

import React from "react";
import CutCornerWrapper from "./cut-corner-wrapper";

export const IndicatorCircle = ({ active }: { active?: boolean }) => {
  return (
    <div
      className={cn(
        "size-4 rounded-full",
        !active ? "bg-red-500" : "bg-green-500",
      )}
    />
  );
};

export default ComputerStates;
