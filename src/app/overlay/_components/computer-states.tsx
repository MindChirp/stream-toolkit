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
      className={cn(
        "absolute top-60 right-0 z-20",
        robotoFlex.className,
        className,
      )}
    >
      <div className="flex flex-col rounded-tl-lg rounded-bl-3xl bg-black/70 px-16 py-2 leading-none font-semibold text-white">
        <span className="flex flex-row items-center justify-between gap-2.5 text-2xl">
          ECU <div className="size-4 rounded-full bg-red-500" />
        </span>
        <span className="flex flex-row items-center justify-between gap-2.5 text-2xl">
          FC <div className="size-4 rounded-full bg-green-500" />
        </span>
      </div>
    </motion.div>
  );
};

export default ComputerStates;
