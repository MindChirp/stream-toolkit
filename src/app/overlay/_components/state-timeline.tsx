import { cn } from "@/lib/utils";
import type { State } from "@/types/states";
import React from "react";

type StateTimelineProps = {
  state: State;
};

const StateTimeline = ({ state, ...props }: StateTimelineProps) => {
  return undefined;
  return (
    <div className="absolute top-0 flex h-40 w-full flex-row items-start justify-center gap-5 bg-gradient-to-b from-black to-transparent pt-5">
      <div className="flex h-20 flex-row items-center">
        {["early-countdown", "final-countdown", "in-flight", "post-flight"].map(
          (s, i) => (
            <TimelineItem label={s} key={i} active={s === state} />
          ),
        )}
      </div>
    </div>
  );
};

const TimelineItem = ({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) => {
  return (
    <h3
      className={cn(
        `${active ? "black rounded-lg bg-gradient-to-b from-white to-white/80 p-2.5" : "text-white/90"} transition-all`,
        "text-2xl",
      )}
    >
      {label}
    </h3>
  );
};

export default StateTimeline;
