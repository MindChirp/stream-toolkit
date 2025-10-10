import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { useTimelineIndex } from "@/lib/hooks/useTimelineIndex";
import { cn } from "@/lib/utils";
import { Roboto_Flex } from "next/font/google";
import { type ComponentProps } from "react";

const robotoFlex = Roboto_Flex({
  variable: "--font-azeret-mono",
  axes: ["GRAD", "wdth", "slnt"],
  subsets: ["latin"],
});

type StateTimelineProps = {
  fc_state?: number;
  ecu_state?: number;
} & ComponentProps<typeof motion.div>;

/**
 * ECU <= 2
 */

const FSM_STATES = [
  "Safe", //ECU State
  "Fuel Fill", // ECU State
  "Post Fuel Fill", // ECU State
  "All Fill", // FC State
  "Drogue Close", // FC State
  "Main Close", // FC State
  "Floatation Close", // FC State
  "N2 Fill", // ECU State
  "Post N2", // ECU State
  "Ox Fill", // ECU State
  "Post Ox", // ECU State
  "Pressurized", // ECU State
  "Armed", // ECU State
  "Burn", // ECU State
  "Coast", // FC State
  "Drogue Chute", // FC State
  "Main Chute", // FC State
  "Flotation", // FC State
  "Recovery", // FC State
];

const StateTimeline = ({
  fc_state,
  ecu_state,
  className,
  ...props
}: StateTimelineProps) => {
  const index = useTimelineIndex({
    fcFsmState: fc_state ?? 0,
    ecuFsmState: ecu_state ?? 0,
  });

  const prevIndex = index !== undefined && index > 0 ? index - 1 : undefined;

  const nextIndex =
    index !== undefined && index < FSM_STATES.length ? index + 1 : undefined;

  if (index == undefined) return undefined;
  return (
    <motion.div
      key="timeline"
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
        "absolute bottom-0 left-1/2 flex w-fit -translate-x-1/2 translate-y-full flex-row items-center justify-center text-center font-semibold whitespace-nowrap text-white",
        className,
      )}
      {...props}
    >
      {prevIndex !== undefined && (
        <span className="absolute -left-2.5 w-fit -translate-x-full text-end whitespace-nowrap">
          {FSM_STATES[prevIndex]}
        </span>
      )}
      <Badge variant={"secondary"} className="w-fit rounded-lg">
        <span
          className={cn("text-2xl font-bold uppercase", robotoFlex.className)}
          style={{
            fontVariationSettings: `"GRAD" 50, "wdth" 200, "slnt" -100`,
          }}
        >
          {index !== undefined && FSM_STATES[index]}
          {index === undefined && "Unknown"}
        </span>
      </Badge>
      {nextIndex !== undefined && (
        <span className="absolute -right-2.5 w-fit translate-x-full text-end whitespace-nowrap">
          {FSM_STATES[nextIndex]}
        </span>
      )}
    </motion.div>
  );
};

export default StateTimeline;
