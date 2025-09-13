import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

const ControlButton = ({
  ...props
}: ComponentProps<typeof Button> & { active?: boolean }) => {
  return <Button variant="secondary" {...props} />;
};

export default ControlButton;
