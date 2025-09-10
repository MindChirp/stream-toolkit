import { cn } from "@/utils/cn";
import { motion } from "motion/react";

import Image from "next/image";
import React, { type ComponentProps } from "react";

const Sponsors: {
  label: string;
  img: string;
}[] = [
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Nammo_logo.svg",
    label: "Nammo",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/NASA_Worm_logo_%28black%29.svg/2560px-NASA_Worm_logo_%28black%29.svg.png",
    label: "NASA",
  },
];

const SponsorReel = ({
  className,
  ...props
}: ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      key="sponsors"
      className={cn(
        "from-background to-background/80 flex h-0 min-h-20 w-96 flex-row items-center gap-2.5 overflow-hidden rounded-l-3xl bg-gradient-to-r px-5 py-2.5",
        className,
      )}
      initial={{
        opacity: 0,
        transform: "translateX(100%)",
      }}
      animate={{
        opacity: 1,
        transform: "translateX(0%)",
      }}
      transition={{
        duration: 1,
        type: "tween",
        ease: "anticipate",
      }}
      exit={{
        transition: {
          type: "tween",
          ease: "circInOut",
        },
        opacity: 0,
        height: 0,
        transform: "translateY(5rem)",
      }}
      {...props}
    >
      {Sponsors.map((sponsor) => (
        <div
          key={sponsor.label}
          className="flex h-auto w-full flex-col items-center justify-between"
        >
          <Image
            src={sponsor.img}
            height={1000}
            width={1000}
            alt="Logo"
            className="max-h-10 w-full object-contain"
          />
          <span>{sponsor.label}</span>
        </div>
      ))}
    </motion.div>
  );
};

export default SponsorReel;
