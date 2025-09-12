import React, { type ComponentProps } from "react";
import { motion } from "motion/react";

const SlideAnimation = ({
  initial,
  animate,
  transition,
  exit,
  ...props
}: ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      initial={{
        transform: "translateY(100%)",
        opacity: 0,
        ...(typeof initial === "object" ? initial : {}),
      }}
      animate={{
        opacity: 1,
        transform: "translateY(0%)",
        ...(typeof animate === "object" ? animate : {}),
      }}
      transition={{
        duration: 1.5,
        type: "spring",
        ease: "easeInOut",
        ...(typeof transition === "object" ? transition : {}),
      }}
      exit={{
        opacity: 0,
        transform: "translateY(100%)",
        ...(typeof exit === "object" ? exit : {}),
      }}
      {...props}
    />
  );
};

export default SlideAnimation;
