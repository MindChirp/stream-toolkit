"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, Loader, SaveIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const sourceFormSchema = z.object({
  source: z.string().min(1, "Source must be defined"),
});

const TelemetrySource = () => {
  const { mutate, isPending } = api.socket.setTelemetrySource.useMutation();

  const sourceForm = useForm<z.infer<typeof sourceFormSchema>>({
    resolver: zodResolver(sourceFormSchema),
    defaultValues: {
      source: "",
    },
  });

  const handleSourceSubmit = (data: z.infer<typeof sourceFormSchema>) => {
    mutate({ source: data.source });
  };
  return (
    <div className="flex w-full flex-col">
      <Form {...sourceForm}>
        <form onSubmit={sourceForm.handleSubmit(handleSourceSubmit)}>
          <FormField
            control={sourceForm.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telemetry source</FormLabel>
                <div className="flex flex-row gap-2.5">
                  <FormControl className="flex flex-row gap-2.5">
                    <Input {...field} placeholder="http://192.168.1...." />
                  </FormControl>
                  <Button type="submit">
                    {!isPending && (
                      <>
                        <CheckIcon />
                        Update
                      </>
                    )}

                    {isPending && <Loader className="animate-spin" />}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default TelemetrySource;
