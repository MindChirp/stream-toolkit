import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Roboto_Flex } from "next/font/google";
import { type ComponentProps } from "react";

type SmallCountdownProps = {
  preLaunch?: boolean;
  time: string;
  background?: boolean;
} & ComponentProps<typeof motion.div>;

const robotoFlex = Roboto_Flex({
  variable: "--font-azeret-mono",
  axes: ["GRAD", "wdth", "slnt"],
  subsets: ["latin"],
});
const SmallCountdown = ({
  preLaunch,
  time,
  className,
  background = true,
  ...props
}: SmallCountdownProps) => {
  return (
    <>
      <motion.div
        key="gradient"
        initial={{
          height: 0,
          width: 0,
        }}
        animate={{
          height: 700,
          width: 700,
        }}
        exit={{
          height: 0,
          width: 0,
          x: "50%",
          transition: {
            ease: "easeInOut",
            duration: 2,
          },
        }}
        transition={{
          duration: 2,
        }}
        className={cn(
          "absolute top-80 right-0 z-10 size-[700px] translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full",
          !background ? "hidden" : undefined,
        )}
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      <motion.div
        key="small-clock-wrapper"
        initial={{
          x: "100%",
        }}
        animate={{
          x: 0,
        }}
        exit={{
          x: "100%",
          transition: {
            duration: 0.5,
            delay: 0.1,
            ease: "easeIn",
          },
        }}
        transition={{ duration: 1, ease: "circOut" }}
        className={cn(
          `absolute top-28 right-0 z-20 flex flex-col gap-2.5`,
          robotoFlex.className,
          className,
        )}
        {...props}
      >
        <div
          className="rounded-tl-lg rounded-bl-3xl bg-black/70 px-14 py-2 leading-none font-semibold text-white"
          style={{
            fontVariationSettings: `"GRAD" 50, "wdth" 200, "slnt" -100`,
          }}
        >
          <span className="mr-3 text-lg text-white/70">
            {preLaunch ? "T-" : "T+"}
          </span>
          <span className="text-2xl">
            {time.slice(0, 2)}:{time.slice(2, 4)}:{time.slice(4, 6)}
          </span>
        </div>
        {/* <h2 className="w-full text-center font-semibold text-white">
          Heimdall
        </h2> */}
      </motion.div>
    </>
  );
};

export default SmallCountdown;
