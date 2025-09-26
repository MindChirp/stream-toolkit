import { Azeret_Mono } from "next/font/google";
import React, { type ReactNode } from "react";

type SystemStatesProps = React.HTMLAttributes<HTMLDivElement> & {
  ECU: boolean;
  FC: boolean;
};

const azeretMono = Azeret_Mono({
  variable: "--font-azeret-mono",
  subsets: ["latin"],
});

const SystemStates = ({ ECU, FC }: SystemStatesProps) => {
  return (
    <div
      className={`flex h-[9.5rem] w-[9.5rem] flex-col items-center justify-center gap-0.5 rounded-full ${azeretMono.className} tracking-tight`}
      style={{
        background:
          "radial-gradient(circle, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.5) 100%)",
      }}
    >
      <h2 className="text-lg leading-none tracking-wide text-white uppercase">
        ECU
      </h2>
      <h2 className="text-lg leading-none tracking-wide text-white uppercase">
        FC
      </h2>
    </div>
  );
};

export default SystemStates;
