import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UiMap } from "@/lib/telemetry/telemetry-client-retrofit";
import { cn } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { Loader, Trash } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { toast } from "sonner";

type TelemetryRowProps = {
  name: string;
  mappings: UiMap[];
  onDelete: () => Promise<unknown>;
} & ComponentProps<typeof Card>;

const TelemetryRow = ({
  name,
  mappings,
  className,
  onDelete,
  ...props
}: TelemetryRowProps) => {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = () => {
    setDeleting(true);
    void onDelete().finally(() => setDeleting(false));
  };
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{mappings.length} mappings</CardDescription>
      </CardHeader>
      <CardContent>
        <CardAction>
          <Button onClick={handleDelete}>
            {deleting ? <Loader className="animate-spin" /> : <Trash />}
          </Button>
        </CardAction>
      </CardContent>
    </Card>
  );
};

export default TelemetryRow;
