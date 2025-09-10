"use client";
import { api } from "@/trpc/react";
import { cn } from "@/utils/cn";
import Header from "components/header";
import { Loader } from "lucide-react";
import React from "react";

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
      <div>
        <h2>Overlay mode</h2>
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
      </div>
    </div>
  );
};

const ControlButton = ({
  className,
  active,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { active?: boolean }) => {
  return (
    <button
      className={cn(
        "bg-secondary hover:bg-tertiary/50 cursor-pointer rounded-lg px-5 py-5 transition-colors",
        { "bg-tertiary": active },
        className,
      )}
      {...props}
    />
  );
};

export default ControlCenter;
