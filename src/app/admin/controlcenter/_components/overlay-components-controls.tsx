"use client";

import Group from "@/app/_components/group";
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
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Save } from "lucide-react";
import React, { type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  navball: z.boolean(),
  altitude: z.boolean(),
  speed: z.boolean(),
  map: z.boolean(),
  polls: z.boolean(),
});

const OverlayComponentsControls = () => {
  const { mutateAsync, status } = api.socket.setOverlayState.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      altitude: true,
      map: true,
      navball: true,
      polls: true,
      speed: true,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    void mutateAsync({
      goNoGoPolls: {
        show: data.polls,
        states: {},
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Group title="Overlay components" className="flex flex-col gap-5">
          {/* <ComponentGroup
            title="Bottom Overlay bar (try not to touch)"
            accordion
          >
            <FormField
              name="navball"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <OverlayComponent
                    component={<Navball />}
                    value={field.value}
                    onChange={field.onChange}
                    id={field.name}
                  />
                </FormControl>
              )}
            />
            <FormField
              control={form.control}
              name="altitude"
              render={({ field }) => (
                <OverlayComponent
                  component={<Gauge label="Altitude" value={0} unit="Meters" />}
                  id="altitude-gauge"
                  {...field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="speed"
              render={({ field }) => (
                <OverlayComponent
                  component={<Gauge label="Speed" value={0} unit="km/h" />}
                  id="speed-gauge"
                  {...field}
                />
              )}
            />
            <FormField
              control={form.control}
              name="map"
              render={({ field }) => (
                <OverlayComponent
                  component={<MapGauge inert lat={63.786826} lng={9.363207} />}
                  id="map-gauge"
                  {...field}
                />
              )}
            />

          </ComponentGroup> */}
          <ComponentGroup>
            <FormField
              control={form.control}
              name="polls"
              render={({ field }) => (
                <OverlayComponent
                  component={<h1>Checklist</h1>}
                  id="go-no-go-polls"
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
        "bg-background border-border flex flex-col items-center rounded-lg border p-5 shadow-sm",
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
