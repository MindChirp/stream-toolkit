"use client";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { Loader } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type z from "zod";
import type { sourceUIMapFormSchema } from "./forms/source-ui-map-form/form-schema";
import SourceUIMapForm from "./forms/source-ui-map-form/source-ui-map-form";
import TelemetryRow from "./telemetry-row";
import { toast } from "sonner";
import type { TRPCError } from "@trpc/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AutoTelemetrySetup from "./auto-telemetry-setup";

const TelemetrySource = () => {
  const { mutateAsync } = api.socket.setupTelemetrySource.useMutation();
  const { data: sources, status: sourcesStatus } =
    api.socket.getTelemetrySources.useQuery();
  const { mutateAsync: deleteSource } =
    api.socket.deleteTelemetrySource.useMutation();
  const utils = api.useUtils();

  const handleSourceSubmit = (data: z.infer<typeof sourceUIMapFormSchema>) => {
    // Get host and port from ip address
    return mutateAsync({
      ...data,
      signOfLife: data.signOfLife !== "none" ? data.signOfLife : undefined,
    })
      .then(() => {
        void utils.socket.invalidate();
      })
      .catch((e: TRPCError) => {
        toast.error("Could not set up telemetry source: " + e.message);
      });
  };
  return (
    <div className="flex w-full flex-col">
      <AutoTelemetrySetup />
      <Accordion type="single" collapsible className="mt-5">
        <AccordionItem value="item-1">
          <AccordionTrigger>Advanced setup</AccordionTrigger>
          <AccordionContent>
            <SourceUIMapForm onSubmit={handleSourceSubmit} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <AnimatePresence>
        {!!sources?.length && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: "hidden" }}
            animate={{
              height: "auto",
              overflow: "initial",
              opacity: 1,
            }}
            exit={{ height: 0, opacity: 0, overflow: "hidden" }}
          >
            <h2 className="">Sources</h2>
            <Separator className="mb-2.5" />
            <div className="flex flex-row flex-wrap gap-2.5">
              {sources?.map((s) => (
                <TelemetryRow
                  onDelete={() => {
                    return deleteSource({
                      host: s.host,
                      port: s.port,
                    })
                      .then(() => {
                        void utils.socket.getTelemetrySources.invalidate();
                      })
                      .catch((e: TRPCError) => toast.error(e.message));
                  }}
                  name={s.host + ":" + s.port}
                  mappings={s.mappings}
                  key={s.host + s.port + Math.random()}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {sourcesStatus === "pending" && <Loader className="animate-spin" />}
    </div>
  );
};

export default TelemetrySource;
