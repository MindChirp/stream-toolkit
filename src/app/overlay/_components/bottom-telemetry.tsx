"use client";
import React, { type ComponentProps } from "react";
import { motion } from "motion/react";
import { cn } from "@/utils/cn";
import Header from "components/header";

const BottomTelemetry = ({
  className,
  ...props
}: ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      key="bottom-telemetry"
      initial={{
        opacity: 0,
        transform: "translateY(100%)",
      }}
      animate={{
        opacity: 1,
        transform: "translateY(0%)",
      }}
      transition={{
        delay: 0.5,
        duration: 3,
        type: "decay",
        ease: "anticipate",
      }}
      exit={{
        opacity: 0,
        height: 0,
        transform: "translateY(50%)",
        transition: {
          ease: "easeIn",
          duration: 1,
          delay: 1,
        },
      }}
      className={cn(
        "flex h-52 items-center justify-center overflow-hidden bg-gradient-to-t from-black to-transparent",
        className,
      )}
      {...props}
    >
      <Header className="font-poppins! tracking-wide text-white">
        T-00:30:00
      </Header>
    </motion.div>
  );
};

export default BottomTelemetry;
