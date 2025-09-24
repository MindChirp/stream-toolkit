import { Azeret_Mono } from "next/font/google";
import React, { type ReactNode } from "react";

type GaugeProps = React.HTMLAttributes<HTMLDivElement> & {
  value: ReactNode;
  label: string;
  unit: string;
};

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"],
});

const Gauge = ({ value, label, unit }: GaugeProps) => {
  return (
    <div
      className={`flex h-[9.5rem] w-[9.5rem] flex-col items-center justify-center gap-0.5 rounded-full ${azeretMono.className} tracking-tight`}
      style={{
        background:
          "radial-gradient(circle, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.5) 100%)",
      }}
    >
      <h2 className="text-lg leading-none tracking-wide text-white uppercase">
        {label}
      </h2>
      <span className="text-4xl leading-none text-white">{value}</span>
      <h2 className="leading-none tracking-wide text-white uppercase">
        {unit}
      </h2>
    </div>
  );
};

export default Gauge;
