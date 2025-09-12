"use client";
import Group from "@/app/_components/group";
import { api } from "@/trpc/react";
import { cn } from "@/utils/cn";
import Header from "components/header";
import { Loader } from "lucide-react";
import React from "react";
import TimerControls from "./_components/timer-controls";
import ControlButton from "./_components/control-button";

const ControlCenter = () => {
  const { mutate, isPending } = api.socket.setOverlayMode.useMutation();
  return (
    <div className="flex w-full flex-col gap-5">
      {isPending && (
        <div className="absolute top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black/20">
          <Loader className="animate-spin" />
        </div>
      )}
      <Header>Control center</Header>
      <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
        <Group title="Overlay mode">
          <div className="grid min-w-96 grid-cols-2 gap-2.5">
            <ControlButton onClick={() => mutate({ mode: "early-countdown" })}>
              Early countdown
            </ControlButton>
            <ControlButton onClick={() => mutate({ mode: "final-countdown" })}>
              Final countdown
            </ControlButton>
            <ControlButton onClick={() => mutate({ mode: "in-flight" })}>
              In-flight
            </ControlButton>
            <ControlButton onClick={() => mutate({ mode: "post-flight" })}>
              Post-flight
            </ControlButton>
          </div>
        </Group>
        <Group title="Timer controls">
          <TimerControls />
        </Group>
        <Group
          title="Danger area"
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
