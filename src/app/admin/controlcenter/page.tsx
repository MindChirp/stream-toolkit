"use client";
import Group from "@/app/_components/group";
import { api } from "@/trpc/react";
import Header from "components/header";
import { Loader } from "lucide-react";
import ControlButton from "./_components/control-button";
import TimerControls from "./_components/timer-controls";
import TelemetrySource from "./_components/telemetry-source";

const ControlCenter = () => {
  const { mutate, isPending } = api.socket.setOverlayState.useMutation();
  const { data: overlayState } = api.socket.onOverlayState.useSubscription();
  return (
    <div className="flex w-full flex-col gap-5">
      {isPending && (
        <div className="absolute top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black/20">
          <Loader className="animate-spin" />
        </div>
      )}
      <Header>Control Center</Header>
      <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
        <Group title="Overlay Mode">
          <div className="grid min-w-96 grid-cols-2 gap-2.5">
            <ControlButton
              onClick={() => mutate({ state: "early-countdown" })}
              variant={
                overlayState?.state === "early-countdown"
                  ? "default"
                  : "secondary"
              }
            >
              Early countdown
            </ControlButton>
            <ControlButton
              onClick={() => mutate({ state: "final-countdown" })}
              variant={
                overlayState?.state === "final-countdown"
                  ? "default"
                  : "secondary"
              }
            >
              Final countdown
            </ControlButton>
            <ControlButton
              onClick={() => mutate({ state: "in-flight" })}
              variant={
                overlayState?.state === "in-flight" ? "default" : "secondary"
              }
            >
              In-flight
            </ControlButton>
            <ControlButton
              onClick={() => mutate({ state: "post-flight" })}
              variant={
                overlayState?.state === "post-flight" ? "default" : "secondary"
              }
            >
              Post-flight
            </ControlButton>
          </div>
        </Group>
        <Group title="Timer Controls">
          <TimerControls />
        </Group>
        <Group title="Telemetry Setup">
          <TelemetrySource />
        </Group>
        <Group
          title="Danger Area"
          variant="danger"
          className="flex flex-row flex-wrap gap-2.5 xl:col-span-2"
        >
          <ControlButton>Scrub</ControlButton>
          <ControlButton>Hold</ControlButton>
        </Group>
      </div>
    </div>
  );
};

export default ControlCenter;
