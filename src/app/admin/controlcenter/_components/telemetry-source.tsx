"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UI_DATASOURCE_TARGETS } from "@/lib/telemetry/constants/ui-targets";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Cable,
  Loader,
  MoveRight,
  PlusIcon,
  SaveIcon,
  Trash,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import TelemetryRow from "./telemetry-row";

const RocketPresets: Record<
  string,
  z.infer<typeof sourceFormSchema>["telemetryUIMap"]
> = {
  heimdallP6005: [
    {
      rawName: "kalman_altitude",
      uiTarget: "altitude",
    },
    {
      rawName: "kalman_velocity",
      uiTarget: "velocity",
    },
    {
      rawName: "acc",
      uiTarget: "accelleration",
    },
    {
      rawName: "kalman_yaw",
      uiTarget: "roll",
    },
    {
      rawName: "kalman_pitch",
      uiTarget: "pitch",
    },
    {
      rawName: "kalman_roll",
      uiTarget: "yaw",
    },
  ],
  bifrostP8080: [
    {
      rawName: "kalman_velocity",
      uiTarget: "velocity",
    },
    {
      rawName: "kalman_altitude",
      uiTarget: "altitude",
    },
    {
      rawName: "pitch",
      uiTarget: "pitch",
    },
    {
      rawName: "yaw",
      uiTarget: "yaw",
    },
    { rawName: "roll", uiTarget: "roll" },
    {
      rawName: "acc_z_moving_average",
      uiTarget: "accelleration",
    },
    {
      rawName: "longitude",
      uiTarget: "lon",
    },
    {
      rawName: "latitude",
      uiTarget: "lat",
    },
  ],
};

const sourceFormSchema = z.object({
  host: z.string().min(1, "Source must be defined"),
  port: z.number(),
  telemetryUIMap: z.array(
    z.object({ rawName: z.string(), uiTarget: z.enum(UI_DATASOURCE_TARGETS) }),
  ),
});

const TelemetrySource = () => {
  const { mutateAsync, isPending } =
    api.socket.setupTelemetrySource.useMutation();
  const { data: sources, status: sourcesStatus } =
    api.socket.getTelemetrySources.useQuery();
  const utils = api.useUtils();

  const sourceForm = useForm<z.infer<typeof sourceFormSchema>>({
    resolver: zodResolver(sourceFormSchema),
  });

  const {
    fields: telemetryUIMapFields,
    append,
    remove,
  } = useFieldArray<z.infer<typeof sourceFormSchema>>({
    name: "telemetryUIMap",
    control: sourceForm.control,
  });

  const handleSourceSubmit = (data: z.infer<typeof sourceFormSchema>) => {
    // Get host and port from ip address
    sourceForm.reset();
    void mutateAsync(data).then(() => {
      void utils.socket.invalidate();
    });
  };
  return (
    <div className="flex w-full flex-col">
      <Form {...sourceForm}>
        <form onSubmit={sourceForm.handleSubmit(handleSourceSubmit)}>
          <div className="flex flex-row items-center gap-1">
            <FormField
              control={sourceForm.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="192.168.1..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={sourceForm.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(parseInt(e.currentTarget.value));
                      }}
                      placeholder="1234"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {sourceForm.formState.touchedFields.host && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              className="mt-5 flex flex-col gap-2.5"
            >
              <Alert>
                <Cable />
                <AlertTitle>Add mappings</AlertTitle>
                <AlertDescription>
                  <span>
                    To provide realtime telemetry data on the stream overlay,
                    telemetry mappings must be added. These map data labels from
                    the <kbd>settings.json</kbd> file to actual UI elements.
                  </span>
                  <span className="mt-2.5 font-semibold">Example</span>
                  <Separator />
                  <div className="flex flex-row flex-wrap items-center gap-1 leading-none">
                    kalman_velocity <MoveRight /> Velocity
                  </div>
                  <div className="flex flex-row flex-wrap items-center gap-1 leading-none">
                    kalman_altitude <MoveRight /> Altitude
                  </div>
                </AlertDescription>
              </Alert>
              <FormLabel className="mt-2.5">Rocket preset</FormLabel>
              <Select
                onValueChange={(value) => {
                  sourceForm.setValue(
                    "telemetryUIMap",
                    RocketPresets[value] ?? [],
                  );
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="bifrostP8080">
                      Bifrost Port 8080
                    </SelectItem>
                    <SelectItem value="heimdallP6005">
                      Heimdall Port 6005
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div>
                <AnimatePresence>
                  {telemetryUIMapFields.map((field, index) => (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                        marginTop: 0,
                        overflow: "hidden",
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        marginTop: 10,
                        overflow: "visible",
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        marginTop: 0,
                        overflow: "hidden",
                      }}
                      key={field.id}
                      className="grid grid-cols-3 grid-rows-2 gap-2.5 gap-y-0"
                    >
                      <FormLabel className="col-start-1 row-start-1">
                        Raw data key
                      </FormLabel>
                      <Input
                        className="col-start-1 row-start-2"
                        {...sourceForm.register(
                          `telemetryUIMap.${index}.rawName`,
                        )}
                      />

                      <FormLabel className="col-start-2 row-start-1">
                        UI Target
                      </FormLabel>

                      <Select
                        defaultValue={field.uiTarget}
                        onValueChange={(
                          value: (typeof UI_DATASOURCE_TARGETS)[0],
                        ) => {
                          console.log(value);
                          sourceForm.setValue(
                            `telemetryUIMap.${index}.uiTarget`,
                            value,
                          );
                        }}
                      >
                        <SelectTrigger className="col-start-2 row-start-2 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="altitude">Altitude</SelectItem>
                            <SelectItem value="velocity">Velocity</SelectItem>
                            <SelectItem value="yaw">Yaw</SelectItem>
                            <SelectItem value="roll">Roll</SelectItem>
                            <SelectItem value="pitch">Pitch</SelectItem>
                            <SelectItem value="accelleration">
                              Accelleration
                            </SelectItem>
                            <SelectItem value="lat">Latitude</SelectItem>
                            <SelectItem value="lon">Longitude</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={() => remove(index)}
                        variant={"outline"}
                        className="col-start-3 row-start-2 w-fit"
                      >
                        <Trash />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <Button
                className="w-fit"
                variant="secondary"
                onClick={() => append({ rawName: "", uiTarget: "yaw" })}
              >
                <PlusIcon />
                Add mapping
              </Button>
            </motion.div>
          )}
          <Button className="mt-5" type="submit">
            <SaveIcon /> Save
          </Button>
        </form>
      </Form>

      <h2 className="mt-5">Sources</h2>
      <Separator className="mb-2.5" />
      <div className="flex flex-row gap-2.5">
        {sources?.map((s) => (
          <TelemetryRow
            name={s.host + ":" + s.port}
            mappings={s.mappings}
            key={s.host + s.port}
          />
        ))}
        {sourcesStatus === "pending" && <Loader className="animate-spin" />}
      </div>
    </div>
  );
};

export default TelemetrySource;
