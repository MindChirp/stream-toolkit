"use client";

import Group from "@/app/_components/group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type PollState,
  type OverlayStateData,
} from "@/server/api/types/overlay";
import { api } from "@/trpc/react";
import { Loader } from "lucide-react";
import { useState } from "react";

type CheckStatesProps = {
  goNoGoPolls?: OverlayStateData["goNoGoPolls"];
};

const CheckStates = ({ goNoGoPolls }: CheckStatesProps) => {
  const { mutateAsync } = api.socket.setOverlayState.useMutation();
  return (
    <Group title="Checklist" className="flex flex-col gap-2.5">
      <StateControl
        label="Propulsion"
        value={goNoGoPolls?.states?.propulsion ?? "tbd"}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { propulsion: value } } })
        }
      />
      <StateControl
        label="Recovery"
        value={goNoGoPolls?.states?.recovery ?? "tbd"}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { recovery: value } } })
        }
      />
      <StateControl
        label="Range"
        value={goNoGoPolls?.states?.range ?? "tbd"}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { range: value } } })
        }
      />
      <StateControl
        label="Pad"
        value={goNoGoPolls?.states?.pad ?? "tbd"}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { pad: value } } })
        }
      />
      <StateControl
        label="Telemetry"
        value={goNoGoPolls?.states?.telemetry ?? "tbd"}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { telemetry: value } } })
        }
      />
      <StateControl
        label="Trajectory"
        value={goNoGoPolls?.states?.trajectory ?? "tbd"}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { trajectory: value } } })
        }
      />
      <StateControl
        label="Pyro"
        value={goNoGoPolls?.states?.pyro ?? "tbd"}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { pyro: value } } })
        }
      />
      <StateControl
        label="Operations"
        value={goNoGoPolls?.states?.operations ?? "tbd"}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { operations: value } } })
        }
      />
    </Group>
  );
};

type StateControlProps = {
  label: string;
  value: PollState;
  onChange: (state: "go" | "nogo" | "tbd") => Promise<unknown>;
};

export const StateControl = ({ label, value, onChange }: StateControlProps) => {
  const [pending, setPending] = useState(false);
  const handleChange = (value: PollState) => {
    setPending(true);
    void onChange(value).finally(() => setPending(false));
  };
  return (
    <div
      className={cn(
        "relative flex w-full flex-row justify-between",
        pending && "pointer-events-none opacity-50",
      )}
    >
      {pending && (
        <Loader className="absolute top-1/2 left-1/2 -translate-1/2 animate-spin" />
      )}
      <h2>{label}</h2>
      <div className="flex flex-row gap-2.5">
        <Button
          variant={value === "go" ? "default" : "outline"}
          className="w-20"
          onClick={() => handleChange("go")}
        >
          Go
        </Button>
        <Button
          variant={value == "nogo" ? "destructive" : "outline"}
          className="w-20"
          onClick={() => handleChange("nogo")}
        >
          No go
        </Button>
        <Button
          variant={value == "tbd" ? "default" : "outline"}
          className="w-20"
          onClick={() => handleChange("tbd")}
        >
          TBD
        </Button>
      </div>
    </div>
  );
};

export default CheckStates;
