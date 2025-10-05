"use client";

import Group from "@/app/_components/group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type OverlayStateData } from "@/server/api/types/overlay";
import { api } from "@/trpc/react";
import { Loader } from "lucide-react";
import { useState } from "react";

type CheckStatesProps = {
  goNoGoPolls: OverlayStateData["goNoGoPolls"];
};

const CheckStates = ({ goNoGoPolls }: CheckStatesProps) => {
  const { mutateAsync } = api.socket.setOverlayState.useMutation();
  return (
    <Group title="Checklist" className="flex flex-col gap-2.5">
      <StateControl
        label="Range"
        value={goNoGoPolls?.states.range as boolean | null}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { range: value } } })
        }
      />
      <StateControl
        label="Weather"
        value={goNoGoPolls?.states.weather as boolean | null}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { weather: value } } })
        }
      />
      <StateControl
        label="Propulsion"
        value={goNoGoPolls?.states.propulsion as boolean | null}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { propulsion: value } } })
        }
      />
      <StateControl
        label="Ground equipment"
        value={goNoGoPolls?.states.gse as boolean | null}
        onChange={(value) =>
          mutateAsync({ goNoGoPolls: { states: { gse: value } } })
        }
      />
    </Group>
  );
};

type StateControlProps = {
  label: string;
  value: boolean | null;
  onChange: (state: boolean | null) => Promise<unknown>;
};

export const StateControl = ({ label, value, onChange }: StateControlProps) => {
  const [pending, setPending] = useState(false);
  const handleChange = (value: boolean | null) => {
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
          variant={value ? "default" : "outline"}
          className="w-20"
          onClick={() => handleChange(true)}
        >
          Go
        </Button>
        <Button
          variant={value == false ? "destructive" : "outline"}
          className="w-20"
          onClick={() => handleChange(false)}
        >
          No go
        </Button>
        <Button
          variant={value == null ? "default" : "outline"}
          className="w-20"
          onClick={() => handleChange(null)}
        >
          TBD
        </Button>
      </div>
    </div>
  );
};

export default CheckStates;
