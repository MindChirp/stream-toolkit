"use client";
import Group from "@/app/_components/group";
import Header from "components/header";
import OverlayComponentsControls from "./_components/overlay-components-controls";
import OverlayStateControls from "./_components/overlay-state-controls";
import TelemetrySource from "./_components/telemetry-source";
import TimerControls from "./_components/timer-controls";

const ControlCenter = () => {
  return (
    <div className="flex w-full flex-col gap-5">
      <Header>Control Center</Header>
      <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
        <OverlayStateControls />
        <OverlayComponentsControls />
        <Group title="Timer Controls">
          <TimerControls />
        </Group>
        <Group title="Telemetry Setup">
          <TelemetrySource />
        </Group>
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
