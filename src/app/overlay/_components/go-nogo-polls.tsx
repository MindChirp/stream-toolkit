import { cn } from "@/lib/utils";
import { PollState, type OverlayStateData } from "@/server/api/types/overlay";
import { motion } from "motion/react";
import { Roboto_Flex } from "next/font/google";
import { type ComponentProps } from "react";

type GoNoGoPollsProps = {
  state: NonNullable<OverlayStateData["goNoGoPolls"]>["states"];
} & ComponentProps<typeof motion.div>;

const robotoFlex = Roboto_Flex({
  variable: "--font-azeret-mono",
  axes: ["GRAD", "wdth", "slnt"],
  subsets: ["latin"],
});

const GoNoGoPolls = ({ state, className, ...props }: GoNoGoPollsProps) => {
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
      className={cn(
        "flex flex-col gap-1 rounded-tl-lg rounded-bl-3xl bg-black/90 px-10 py-5",
        className,
      )}
      {...props}
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

      <State type="Propulsion" state={state.propulsion} />
      <State type="Recovery" state={state.recovery} />
      <State type="Range" state={state.range} />
      <State type="Pad" state={state.pad} />
      <State type="Telemetry" state={state.telemetry} />
      <State type="Trajectory" state={state.trajectory} />
      <State type="Pyro" state={state.pyro} />
      <State type="Operations" state={state.operations} />
    </motion.div>
  );
};

const StateLabelMap = {
  go: "Go",
  nogo: "No go",
  tbd: "TBD",
};

const State = ({ type, state }: { type: string; state: PollState }) => {
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
          "w-20 min-w-20 rounded-md text-center font-semibold",
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
