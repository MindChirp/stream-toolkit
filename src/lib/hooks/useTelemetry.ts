import { api } from "@/trpc/react";
import { UI_DATASOURCE_TARGETS } from "../telemetry/constants/ui-targets";

export const useTelemetry = (): Record<
  (typeof UI_DATASOURCE_TARGETS)[number],
  unknown
> => {
  const { data: telemetry } = api.socket.onTelemetry.useSubscription();

  // Ensure all keys are present in the mapped object
  const mapped = (UI_DATASOURCE_TARGETS as readonly string[]).reduce(
    (acc, key) => {
      acc[key as (typeof UI_DATASOURCE_TARGETS)[number]] =
        telemetry?.uiMaps.find((m) => m.uiTarget === key)
          ? telemetry?.telemetry[
              telemetry.uiMaps.find((m) => m.uiTarget === key)!.from
            ]
          : undefined;
      return acc;
    },
    {} as Record<(typeof UI_DATASOURCE_TARGETS)[number], unknown>,
  );

  return mapped;
};
