"use server";

import { UIMappingsRocketPresets } from "@/app/admin/controlcenter/_components/constants/ui-mappings";
import { api } from "@/trpc/server";

const PORTS = {
  fc_kalman: 6005, // Used for altitude, velocity, orientation etc
  fc_status: 6002, // Used for fc fsm state
  fc_navigation: 6004, // Used for gps coordinates
  ecu_status: 9994,
};

export const setupHeimdall = async ({
  ecu_ip,
  fc_ip,
}: {
  ecu_ip: string;
  fc_ip: string;
}) => {
  // Setup fc kalman filter, use as sign of life indication for FC
  await api.socket.setupTelemetrySource({
    host: fc_ip,
    port: PORTS.fc_kalman,
    telemetryUIMap: UIMappingsRocketPresets.heimdallP6005!,
    signOfLife: "fc",
  });

  // Setup fc navigation
  await api.socket.setupTelemetrySource({
    host: fc_ip,
    port: PORTS.fc_navigation,
    telemetryUIMap: UIMappingsRocketPresets.heimdallP6004!,
  });

  await api.socket.setupTelemetrySource({
    host: fc_ip,
    port: PORTS.fc_status,
    telemetryUIMap: UIMappingsRocketPresets.heimdallP6002!,
  });

  await api.socket.setupTelemetrySource({
    host: ecu_ip,
    port: PORTS.ecu_status,
    telemetryUIMap: UIMappingsRocketPresets.heimdallP9994!,
    signOfLife: "ecu",
  });
};
