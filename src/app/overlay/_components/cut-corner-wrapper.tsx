import { cn } from "@/lib/utils";
import React, { type ComponentProps } from "react";

type CutCornerWrapperProps = {
  cutSize?: number;
  corner?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
} & ComponentProps<"div">;
const CutCornerWrapper = ({
  cutSize = 20,
  corner = "bottomLeft",
  className,
  style,
  ...props
}: CutCornerWrapperProps) => {
  if (corner === "topRight") {
    return (
      <div
        className={cn("", className)}
        style={{
          WebkitClipPath: `polygon(0 0, 0 100%, 100% 100%, 100% ${cutSize}px, calc(100% - ${cutSize}px) 0)`,
          clipPath: `polygon(0 0, 0 100%, 100% 100%, 100% ${cutSize}px, calc(100% - ${cutSize}px) 0)`,
          ...style,
        }}
        {...props}
      />
    );
  } else if (corner === "bottomRight") {
    return (
      <div
        className={cn("", className)}
        style={{
          WebkitClipPath: `polygon(0 0, 0 100%, calc(100% - ${cutSize}px) 100%, 100% calc(100% - ${cutSize}px), 100% 0)`,
          clipPath: `polygon(0 0, 0 100%, calc(100% - ${cutSize}) 100%, 100% calc(100% - ${cutSize}px), 100% 0)`,

          ...style,
        }}
        {...props}
      />
    );
  } else if (corner === "topLeft") {
    return (
      <div
        className={cn("", className)}
        style={{
          WebkitClipPath: `polygon(${cutSize}px 0, 0 ${cutSize}px, 0 100%, 100% 100%, 100% 0)`,
          clipPath: `polygon(${cutSize}px 0, 0 ${cutSize}px, 0 100%, 100% 100% 100% 0)`,

          ...style,
        }}
        {...props}
      />
    );
  } else if (corner === "bottomLeft") {
    return (
      <div
        className={cn("", className)}
        style={{
          WebkitClipPath: `polygon(0 0, 0 calc(100% - ${cutSize}px), ${cutSize}px 100%, 100% 100%, 100% 0)`,
          clipPath: `polygon(0 0, 0 calc(100% - ${cutSize}px), ${cutSize}px 100%, 100% 100%, 100% 0)`,
          ...style,
        }}
        {...props}
      />
    );
  }
};

export default CutCornerWrapper;
