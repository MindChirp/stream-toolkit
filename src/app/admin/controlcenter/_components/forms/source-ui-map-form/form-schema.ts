import { UI_DATASOURCE_TARGETS } from "@/lib/telemetry/constants/ui-targets";
import z from "zod";

export const sourceUIMapFormSchema = z.object({
  host: z.string().min(1, "Source must be defined"),
  port: z.number(),
  telemetryUIMap: z.array(
    z.object({
      rawName: z.string().min(1, "Source label is required"),
      uiTarget: z.enum(UI_DATASOURCE_TARGETS),
    }),
  ),
  signOfLife: z.enum(["ecu", "fc", "none"]).optional(),
});
