import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const ControlButton = ({
  className,
  active,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { active?: boolean }) => {
  return <Button {...props} />;
};

export default ControlButton;
