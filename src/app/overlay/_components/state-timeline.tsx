import { Badge } from "@/components/ui/badge";
import { FSM_STATES } from "@/lib/telemetry/constants/fsm-states";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Roboto_Flex } from "next/font/google";
import { type ComponentProps } from "react";

const robotoFlex = Roboto_Flex({
  variable: "--font-azeret-mono",
  axes: ["GRAD", "wdth", "slnt"],
  subsets: ["latin"],
});

type StateTimelineProps = {
  timelineIndex?: number;
  extraStates?: boolean;
  connectingLines?: boolean;
} & ComponentProps<typeof motion.div>;

const StateTimeline = ({
  timelineIndex,
  className,
  extraStates,
  connectingLines,
  ...props
}: StateTimelineProps) => {
  const prevPrevIndex =
    timelineIndex !== undefined && timelineIndex > 1
      ? timelineIndex - 2
      : undefined;

  const prevIndex =
    timelineIndex !== undefined && timelineIndex > 0
      ? timelineIndex - 1
      : undefined;

  const nextIndex =
    timelineIndex !== undefined && timelineIndex < FSM_STATES.length - 1
      ? timelineIndex + 1
      : undefined;

  const nextNextIndex =
    timelineIndex !== undefined && timelineIndex < FSM_STATES.length - 2
      ? timelineIndex + 2
      : undefined;

  if (timelineIndex == undefined) return undefined;
  return (
    <>
      {timelineIndex !== undefined && (
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
            "flex w-fit flex-row items-center justify-center text-center font-semibold whitespace-nowrap text-white",
            className,
          )}
          {...props}
        >
          <div className="absolute -left-2.5 flex w-fit -translate-x-full flex-row items-center justify-center gap-5 whitespace-nowrap">
            {prevPrevIndex !== undefined && extraStates && (
              <>
                <span className="w-fit">{FSM_STATES[prevPrevIndex]}</span>
                {connectingLines && <TimelineLine />}
              </>
            )}

            {prevIndex !== undefined && (
              <>
                <span className="w-fit">{FSM_STATES[prevIndex]}</span>
                {connectingLines && <TimelineLine />}
              </>
            )}
          </div>
          <Badge variant={"secondary"} className="w-fit rounded-lg">
            <span
              className={cn(
                "text-2xl font-bold uppercase",
                robotoFlex.className,
              )}
              style={{
                fontVariationSettings: `"GRAD" 50, "wdth" 200, "slnt" -100`,
              }}
            >
              {timelineIndex !== undefined && FSM_STATES[timelineIndex]}
              {timelineIndex === undefined && "Unknown"}
            </span>
          </Badge>
          <div className="absolute -right-2.5 flex w-fit translate-x-full flex-row items-center justify-center gap-5 whitespace-nowrap">
            {nextIndex !== undefined && (
              <>
                {connectingLines && <TimelineLine />}
                <span className="w-fit">{FSM_STATES[nextIndex]}</span>
              </>
            )}
            {nextNextIndex && extraStates !== undefined && (
              <>
                {connectingLines && <TimelineLine />}
                <span className="w-fit">{FSM_STATES[nextNextIndex]}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

const TimelineLine = () => {
  return <div className="h-0.5 w-10 bg-white" />;
};

export default StateTimeline;
