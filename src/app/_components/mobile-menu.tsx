import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { type ComponentProps } from "react";

const MobileMenu = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn(`flex flex-row`, className)} {...props}></div>;
};

export default MobileMenu;
