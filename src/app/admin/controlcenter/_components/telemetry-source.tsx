"use client";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { Loader } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type z from "zod";
import type { sourceUIMapFormSchema } from "../forms/source-ui-map-form/form-schema";
import SourceUIMapForm from "../forms/source-ui-map-form/source-ui-map-form";
import TelemetryRow from "./telemetry-row";
import { toast } from "sonner";

const TelemetrySource = () => {
  const { mutateAsync } = api.socket.setupTelemetrySource.useMutation();
  const { data: sources, status: sourcesStatus } =
    api.socket.getTelemetrySources.useQuery();
  const { mutateAsync: deleteSource } =
    api.socket.deleteTelemetrySource.useMutation();
  const utils = api.useUtils();

  const handleSourceSubmit = (data: z.infer<typeof sourceUIMapFormSchema>) => {
    // Get host and port from ip address
    return mutateAsync(data)
      .then(() => {
        void utils.socket.invalidate();
      })
      .catch(() => {
        toast.error("Could not set up telemetry source");
      });
  };
  return (
    <div className="flex w-full flex-col">
      <SourceUIMapForm onSubmit={handleSourceSubmit} />
      <AnimatePresence>
        {!!sources?.length && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{ height: 0, opacity: 0 }}
          >
            <h2 className="mt-5">Sources</h2>
            <Separator className="mb-2.5" />
            <div className="flex flex-row flex-wrap gap-2.5">
              {sources?.map((s) => (
                <TelemetryRow
                  onDelete={() => {
                    return deleteSource({
                      host: s.host,
                      port: s.port,
                    }).then(() => {
                      void utils.socket.getTelemetrySources.invalidate();
                    });
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
