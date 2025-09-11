import type { State } from "@/types/states";
import React from "react";

type StateTimelineProps = {
  state: State;
};
const StateTimeline = ({ state, ...props }: StateTimelineProps) => {
  return (
    <div className="absolute top-0 left-1/2 flex h-20 w-3/5 -translate-x-1/2 flex-row items-center">
      <div className="h-5 w-0.5 bg-white" />
      <div className="h-0.5 w-full bg-white" />
      <div className="h-5 w-0.5 bg-white" />
    </div>
  );
};

export default StateTimeline;
