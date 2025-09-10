"use client";
import { cn } from "@/utils/cn";
import { HomeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = ({ className, ...props }: React.HTMLProps<HTMLDivElement>) => {
  const pathname = usePathname();
  return (
    <div
      className={cn(
        "bg-secondary flex h-auto w-64 flex-col items-center px-2 py-10",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-2.5 rounded-lg p-2.5">
        <Image
          src="/images/logo.png"
          className="w-3/5"
          alt="Propulse logo"
          width={1000}
          height={1000}
        />
      </div>
      <div className="flex w-full flex-col items-center lg:mt-20">
        <SidebarButton to={"/admin"} active={pathname === "/"}>
          Hjem
        </SidebarButton>
        <SidebarButton to={"/overlay"} active={pathname === "/overlay"}>
          Overlay
        </SidebarButton>
        <SidebarButton
          to={"/admin/controlcenter"}
          active={pathname === "/kontrollsenter"}
        >
          Kontrollsenter
        </SidebarButton>
      </div>
    </div>
  );
};

type SidebarButtonProps = {
  active?: boolean;
  to: string;
} & React.HTMLAttributes<HTMLButtonElement>;
const SidebarButton = ({
  to,
  className,
  active,
  ...props
}: SidebarButtonProps) => {
  return (
    <Link href={to} className="w-full">
      <button
        className={cn(
          "hover:bg-tertiary/50 flex w-full cursor-pointer flex-row items-center justify-center gap-1 rounded-lg bg-transparent px-5 py-2.5 transition-colors",
          { "font-bold": active },
          className,
        )}
        {...props}
      />
    </Link>
  );
};

export default Sidebar;
