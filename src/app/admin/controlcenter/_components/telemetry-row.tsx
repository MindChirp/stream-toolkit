import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UiMap } from "@/lib/telemetry/telemetry-client-retrofit";
import { cn } from "@/lib/utils";
import { Delete, Trash } from "lucide-react";
import React, { type ComponentProps } from "react";

type TelemetryRowProps = {
  name: string;
  mappings: UiMap[];
} & ComponentProps<"div">;

const TelemetryRow = ({
  name,
  mappings,
  className,
  ...props
}: TelemetryRowProps) => {
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
      <Button variant="ghost" className="cursor-pointer">
        <Trash />
      </Button>
    </div>
  );
};

export default TelemetryRow;
