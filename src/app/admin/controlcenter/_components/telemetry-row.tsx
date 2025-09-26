import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UiMap } from "@/lib/telemetry/telemetry-client-retrofit";
import { cn } from "@/lib/utils";
import { Delete, Trash } from "lucide-react";
import React, { useState, type ComponentProps } from "react";

type TelemetryRowProps = {
  name: string;
  mappings: UiMap[];
  onDelete: () => Promise<unknown>;
} & ComponentProps<"div">;

const TelemetryRow = ({
  name,
  mappings,
  className,
  onDelete,
  ...props
}: TelemetryRowProps) => {
  const [deleting, setDeleting] = useState(false);
  return (
    <div
      className={cn(
        "bg-secondary flex flex-row gap-5 rounded-lg px-5 py-2.5",
        className,
      )}
      {...props}
    >
      <Badge variant="outline">{name}</Badge>
      <Badge variant={"outline"}>{mappings.length} data sources</Badge>
      <Button
        variant="ghost"
        className="cursor-pointer"
        onClick={() => {
          setDeleting(true);
          void onDelete().finally(() => {
            setDeleting(false);
          });
        }}
      >
        <Trash />
      </Button>
    </div>
  );
};

export default TelemetryRow;
