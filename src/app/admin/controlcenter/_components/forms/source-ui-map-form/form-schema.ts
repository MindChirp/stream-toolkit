import { UI_DATASOURCE_TARGETS } from "@/lib/telemetry/constants/ui-targets";
import z from "zod";

export const sourceUIMapFormSchema = z.object({
  host: z.string().min(1, "Source must be defined"),
  port: z.number(),
  telemetryUIMap: z.array(
    z.object({ rawName: z.string(), uiTarget: z.enum(UI_DATASOURCE_TARGETS) }),
  ),
});
