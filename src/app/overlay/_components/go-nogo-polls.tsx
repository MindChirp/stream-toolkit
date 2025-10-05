import { cn } from "@/lib/utils";
import { type OverlayStateData } from "@/server/api/types/overlay";
import { motion } from "motion/react";
import { Roboto_Flex } from "next/font/google";

type GoNoGoPollsProps = {
  state: NonNullable<OverlayStateData["goNoGoPolls"]>["states"];
};

const robotoFlex = Roboto_Flex({
  variable: "--font-azeret-mono",
  axes: ["GRAD", "wdth", "slnt"],
  subsets: ["latin"],
});

const GoNoGoPolls = ({ state }: GoNoGoPollsProps) => {
  const getStateValue = (value: boolean | undefined | null) => {
    if (value === undefined) return "tbd";
    return value ? "go" : "nogo";
  };

  return (
    <motion.div
      key="go-no-go-polls"
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
      className="absolute top-[30rem] right-0 z-20 flex flex-col gap-1 rounded-tl-lg rounded-bl-3xl bg-black/70 px-10 py-5"
    >
      <span
        className={cn(
          "mb-2 text-2xl font-semibold text-white",
          robotoFlex.className,
        )}
        style={{
          fontVariationSettings: `"GRAD" 50, "wdth" 200, "slnt" -100`,
        }}
      >
        Checklist
      </span>
      <State type="Range" state={getStateValue(state?.range)} />
      <State type="Weather" state={getStateValue(state?.weather)} />
      <State type="Propulsion" state={getStateValue(state?.propulsion)} />
      <State type="Filling station" state={getStateValue(state?.gse)} />
    </motion.div>
  );
};

const StateLabelMap = {
  go: "Go",
  nogo: "No go",
  tbd: "TBD",
};

const State = ({
  type,
  state,
}: {
  type: string;
  state: "go" | "nogo" | "tbd";
}) => {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between gap-5 text-xl text-white",
        robotoFlex.className,
      )}
    >
      <span>{type}</span>
      <span
        className={cn(
          "w-20 rounded-md text-center font-semibold",
          robotoFlex.className,
          state === "go"
            ? "bg-green-500"
            : state === "nogo"
              ? "bg-destructive"
              : "bg-amber-500",
        )}
        style={{
          fontVariationSettings: `"GRAD" 50, "wdth" 300, "slnt" -150`,
        }}
      >
        {StateLabelMap[state]}
      </span>
    </div>
  );
};

export default GoNoGoPolls;
