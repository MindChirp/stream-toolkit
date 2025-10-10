import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const ControlButton = ({
  className,
  ...props
}: ComponentProps<typeof Button> & { active?: boolean }) => {
  return (
    <Button variant="secondary" className={cn("py-10", className)} {...props} />
  );
};

export default ControlButton;
