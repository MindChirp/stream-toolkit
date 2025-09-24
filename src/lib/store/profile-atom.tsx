import { atomWithStorage } from "jotai/utils";
import { Gauge, Rocket, SatelliteDish, type LucideProps } from "lucide-react";
import type React from "react";

export enum Profile {
  MISSION_CONTROL = "mission-control",
  ENGINIONICS = "engionics",
  STREAMER = "streamer",
}

export const profileAtom = atomWithStorage<Profile | null>("profile", null);

export const ProfileIcon: Record<Profile, React.FC<LucideProps>> = {
  "mission-control": Rocket,
  engionics: Gauge,
  streamer: SatelliteDish,
};
