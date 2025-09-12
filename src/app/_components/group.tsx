import { cn } from "@/utils/cn";
import { TriangleAlert } from "lucide-react";
import React from "react";

const Group = ({
  className,
  title,
  variant = "default",
  ...props
}: React.HTMLProps<HTMLDivElement> & {
  title?: string;
  variant?: "danger" | "default";
}) => {
  return (
    <div
      className={cn(
        `border-border relative rounded-xl border-3 p-5`,
        { "border-red-400": variant === "danger" },
        className,
      )}
      {...props}
    >
      <h2
        className={cn(
          "bg-background absolute top-0 left-5 flex -translate-y-1/2 flex-row items-center gap-2 px-2 text-lg",
          { "text-red-400": variant === "danger" },
          { hidden: !title },
        )}
      >
        {variant === "danger" && <TriangleAlert />}
        {title}
      </h2>
      {props.children}
    </div>
  );
};

export default Group;
