"use client";

import Group from "@/app/_components/group";
import ComputerStates from "@/app/overlay/_components/computer-states";
import GoNoGoPolls from "@/app/overlay/_components/go-nogo-polls";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { type DecodedData } from "@/lib/telemetry/telemetry-client-retrofit";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Save } from "lucide-react";
import React, { type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  polls: z.boolean(),
  lifesigns: z.boolean(),
});

const OverlayComponentsControls = ({
  telemetry,
}: {
  telemetry?: DecodedData["uiMappedTelemetry"];
}) => {
  const { mutateAsync, status } = api.socket.setOverlayState.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      polls: true,
      lifesigns: true,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    void mutateAsync({
      goNoGoPolls: {
        show: data.polls,
        states: {},
      },
      signOfLife: {
        show: data.lifesigns,
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Group title="Overlay components" className="flex flex-col gap-5">
          <ComponentGroup>
            <FormField
              control={form.control}
              name="polls"
              render={({ field }) => (
                <OverlayComponent
                  component={
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                      <GoNoGoPolls
                        className="relative top-0 scale-70"
                        state={{
                          operations: "tbd",
                          pad: "tbd",
                          propulsion: "tbd",
                          pyro: "tbd",
                          range: "tbd",
                          recovery: "tbd",
                          telemetry: "tbd",
                          trajectory: "tbd",
                        }}
                      />
                    </div>
                  }
                  id="go-no-go-polls"
                  {...field}
                />
              )}
            />
            <FormField
              control={form.control}
              name="lifesigns"
              render={({ field }) => (
                <OverlayComponent
                  component={
                    <div className="relative flex h-full w-full items-center overflow-hidden">
                      <ComputerStates
                        ecu={Boolean(telemetry?.ecu_active)}
                        fc={Boolean(telemetry?.fc_active)}
                        className="relative top-0 right-0"
                      />
                    </div>
                  }
                  id="lifesigns"
                  {...field}
                />
              )}
            />
          </ComponentGroup>
          <Button className="w-fit" size="lg" type="submit">
            {status === "pending" && <Loader className="animate-spin" />}
            {status !== "pending" && (
              <>
                <Save /> Save
              </>
            )}
          </Button>
        </Group>
      </form>
    </Form>
  );
};

type ComponentGroupProps = {
  title?: string;
  children?: React.ReactNode;
  accordion?: boolean;
};
export const ComponentGroup = ({
  accordion,
  title,
  children,
}: ComponentGroupProps) => {
  return (
    <div className="flex flex-col gap-5">
      {accordion && (
        <Accordion type="single" collapsible>
          <AccordionItem value={title ?? "accordion" + Math.random()}>
            <AccordionTrigger>
              <span className="mt-2.5 font-semibold">{title}</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-3 gap-2.5">{children}</div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {!accordion && (
        <>
          {title && (
            <div className="flex flex-col gap-1">
              <span>{title}</span>
              <Separator />
            </div>
          )}
          <div className="grid grid-cols-3 gap-2.5">{children}</div>
        </>
      )}
    </div>
  );
};

type OverlayComponentProps = {
  component: React.ReactNode;
  id: string;
  value: boolean;
  onChange: (state: boolean) => void;
} & ComponentProps<typeof Label>;
export const OverlayComponent = ({
  component,
  id,
  className,
  onChange,
  value,
  ...props
}: OverlayComponentProps) => {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "bg-background border-border flex flex-col items-center justify-between rounded-lg border p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      {component}
      <Checkbox
        className="h-10 w-10 rounded-full shadow-sm"
        id={id}
        checked={value}
        onCheckedChange={(checked) => onChange(Boolean(checked.valueOf()))}
      />
    </Label>
  );
};

export default OverlayComponentsControls;
