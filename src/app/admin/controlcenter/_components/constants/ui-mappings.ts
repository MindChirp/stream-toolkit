import type z from "zod";
import type { sourceUIMapFormSchema } from "../../forms/source-ui-map-form/form-schema";

export const UIMappingsRocketPresets: Record<
  string,
  z.infer<typeof sourceUIMapFormSchema>["telemetryUIMap"]
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
