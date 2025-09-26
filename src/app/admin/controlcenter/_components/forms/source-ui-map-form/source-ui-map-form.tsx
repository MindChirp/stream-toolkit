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
import { type UI_DATASOURCE_TARGETS } from "@/lib/telemetry/constants/ui-targets";
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
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type z from "zod";
import { UIMappingsRocketPresets } from "../../constants/ui-mappings";
import { sourceUIMapFormSchema } from "./form-schema";

type SourceUIMapFormProps = {
  onSubmit: (data: z.infer<typeof sourceUIMapFormSchema>) => Promise<unknown>;
};

const SourceUIMapForm = ({ onSubmit }: SourceUIMapFormProps) => {
  const [saving, setSaving] = useState(false);
  const sourceForm = useForm<z.infer<typeof sourceUIMapFormSchema>>({
    resolver: zodResolver(sourceUIMapFormSchema),
    defaultValues: {
      host: "",
    },
  });

  const {
    fields: telemetryUIMapFields,
    append,
    remove,
  } = useFieldArray<z.infer<typeof sourceUIMapFormSchema>>({
    name: "telemetryUIMap",
    control: sourceForm.control,
  });

  const handleSubmit = (data: z.infer<typeof sourceUIMapFormSchema>) => {
    setSaving(true);
    void onSubmit(data)
      .then(() => {
        sourceForm.reset();
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <Form {...sourceForm}>
      <form onSubmit={sourceForm.handleSubmit(handleSubmit)}>
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
                  UIMappingsRocketPresets[value] ?? [],
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
        <Button className="mt-5" type="submit" disabled={saving}>
          {saving && <Loader className="animate-spin" />}
          {!saving && (
            <>
              <SaveIcon /> Save
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SourceUIMapForm;
