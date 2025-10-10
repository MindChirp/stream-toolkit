"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setupHeimdall } from "@/lib/telemetry/constants/auto-setup-configs/heimdall";
import { api } from "@/trpc/react";
import { TRPCError } from "@trpc/server";
import { Cable, CheckIcon, Loader } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  rocket: z.enum(["heimdall"]),
  ecuIP: z.string().min(7),
  fcIP: z.string().min(7),
});

const AutoTelemetrySetup = () => {
  const utils = api.useUtils();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      ecuIP: "10.19.0.111",
      fcIP: "10.19.0.110",
      rocket: "heimdall",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (data.rocket === "heimdall") {
      setPending(true);
      void setupHeimdall({
        ecu_ip: data.ecuIP,
        fc_ip: data.fcIP,
      })
        .then(() => {
          void utils.socket.getTelemetrySources.invalidate();
          setError(false);
        })
        .catch((e: TRPCError) => {
          toast.error(`Could not auto-setup telemetry source: ${e.message}`);
          setError(true);
        })
        .finally(() => setPending(false));
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-col gap-2.5">
          <FormField
            control={form.control}
            name="rocket"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rocket preset</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="heimdall">Heimdall</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex flex-row gap-2.5">
            <FormField
              control={form.control}
              name="ecuIP"
              render={({ field }) => (
                <Field className="gap-1">
                  <FieldLabel>ECU IP</FieldLabel>
                  <Input {...field} />
                </Field>
              )}
            />

            <FormField
              control={form.control}
              name="fcIP"
              render={({ field }) => (
                <Field className="gap-1">
                  <FieldLabel>FC IP</FieldLabel>
                  <Input {...field} />
                </Field>
              )}
            />
          </div>
          {error && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}>
              <Alert>
                <Cable />
                <AlertTitle>Issues setting up telemetry?</AlertTitle>
                <AlertDescription>
                  <span>
                    If you&apos;re encountering errors while setting up
                    telemetry sources, try modifying the ECU and FC IP addresses
                  </span>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          <Button className="mt-1 w-fit" disabled={pending}>
            {pending && <Loader className="animate-spin" />}
            {!pending && (
              <>
                <CheckIcon /> Set up
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AutoTelemetrySetup;
