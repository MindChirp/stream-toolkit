import type z from "zod";
import type { sourceUIMapFormSchema } from "../forms/source-ui-map-form/form-schema";

export const UIMappingsRocketPresets: Record<
  string,
  z.infer<typeof sourceUIMapFormSchema>["telemetryUIMap"]
> = {
  heimdallP9994: [{ rawName: "fsm_state", uiTarget: "ecu_state" }],
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
      uiTarget: "yaw",
    },
    {
      rawName: "kalman_pitch",
      uiTarget: "pitch",
    },
    {
      rawName: "kalman_roll",
      uiTarget: "roll",
    },
  ],
  heimdallP6004: [
    {
      rawName: "neo_longitude",
      uiTarget: "lon",
    },
    {
      rawName: "neo_latitude",
      uiTarget: "lat",
    },
  ],
  heimdallP6002: [{ rawName: "fsm_state", uiTarget: "fc_state" }],
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
      uiTarget: "roll",
    },
    { rawName: "roll", uiTarget: "yaw" },
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
