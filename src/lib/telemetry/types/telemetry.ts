export type Telemetry = {
  kalman_fc?: {
    kalman_altitude: number;
    kalman_velocity: number;
    kalman_yaw: number;
    kalman_pitch: number;
    kalman_roll: number;
    acceleration: number;
  };
};
