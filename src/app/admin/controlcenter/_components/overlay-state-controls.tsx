"use client";

import Group from "@/app/_components/group";
import React from "react";
import ControlButton from "./control-button";
import { api } from "@/trpc/react";
import { Loader } from "lucide-react";

const OverlayStateControls = () => {
  const { mutate, isPending } = api.socket.setOverlayState.useMutation();
  const { data: overlayState } = api.socket.onOverlayState.useSubscription();
  return (
    <>
      {isPending && (
        <div className="absolute top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black/20">
          <Loader className="animate-spin" />
        </div>
      )}
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
    </>
  );
};

export default OverlayStateControls;
