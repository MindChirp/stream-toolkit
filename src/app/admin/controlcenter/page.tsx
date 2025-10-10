"use client";

import Group from "@/app/_components/group";
import Header from "components/header";
import OverlayComponentsControls from "./_components/overlay-components-controls";
import OverlayStateControls from "./_components/overlay-state-controls";
import TelemetrySource from "./_components/telemetry-source";
import TimerControls from "./_components/timer-controls";
import CheckStates from "./_components/check-states";
import { api } from "@/trpc/react";
import MessageControls from "./_components/message-controls";
import SponsorControls from "./_components/sponsor-controls";

const ControlCenter = () => {
  const { data: states } = api.socket.onOverlayState.useSubscription();
  // const states = undefined;

  return (
    <div className="flex w-full flex-col gap-10">
      <Header>Overlay Controls</Header>
      <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
        <OverlayStateControls state={states?.state} />
        <OverlayComponentsControls />
        <Group title="Timer Controls">
          <TimerControls />
        </Group>
        <CheckStates goNoGoPolls={states?.goNoGoPolls} />
        <Group title="Telemetry Setup">
          <TelemetrySource />
        </Group>
        <MessageControls />
        <SponsorControls />
        {/* <Group
          title="Danger Area"
          variant="danger"
          className="flex flex-row flex-wrap gap-2.5 xl:col-span-2"
        >
          <ControlButton>Scrub</ControlButton>
          <ControlButton>Hold</ControlButton>
        </Group> */}
      </div>
    </div>
  );
};

export default ControlCenter;
