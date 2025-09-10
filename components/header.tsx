import { cn } from "@/utils/cn";
import { Kameron } from "next/font/google";
import React from "react";

const kameron = Kameron({
  variable: "--font-kameron",
});

const Header = ({
  className,
  ...props
}: React.HTMLProps<HTMLHeadingElement>) => {
  return (
    <h1
      className={cn(kameron.className, "text-5xl font-black", className)}
      {...props}
    />
  );
};

export default Header;
