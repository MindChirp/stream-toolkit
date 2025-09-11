import React from "react";

type GaugeProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  label: string;
  unit: string;
};
const Gauge = ({ value, label, unit }: GaugeProps) => {
  return (
    <div
      className="flex h-[9.5rem] w-[9.5rem] flex-col items-center justify-center gap-0.5 rounded-full"
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
