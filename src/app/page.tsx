"use client";

import { Button } from "@/components/ui/button";
import { Profile, profileAtom } from "@/lib/store/profile-atom";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai/react";
import { Gauge, Rocket, SatelliteDish } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, type ComponentProps } from "react";

const HomePage = () => {
  const [profile, setProfile] = useAtom(profileAtom);
  const router = useRouter();

  useEffect(() => {
    if (profile !== null) {
      router.push("/admin");
    }
  }, [profile, router]);

  const handleProfileSelect = (selectedProfile: Profile) => {
    setProfile(selectedProfile);
    router.push("/admin");
  };

  return (
    <div className="bg-background flex h-screen w-full flex-row">
      <main className="bg-background absolute top-1/2 left-1/2 z-10 flex h-fit -translate-1/2 flex-col items-center justify-center gap-2.5 rounded-lg px-10 py-5 md:relative md:h-full md:w-1/4 md:rounded-none md:bg-transparent md:p-0">
        <h1 className="text-foreground font-semibold">Choose profile</h1>
        <div className="flex flex-col gap-2.5">
          <ProfileButton
            onClick={() => handleProfileSelect(Profile.MISSION_CONTROL)}
          >
            <Rocket size={25} className="h-32 w-32" />
            Mission control
          </ProfileButton>
          <ProfileButton
            onClick={() => handleProfileSelect(Profile.ENGINIONICS)}
          >
            <Gauge />
            Engionics
          </ProfileButton>
          <ProfileButton onClick={() => handleProfileSelect(Profile.STREAMER)}>
            <SatelliteDish />
            Streamer
          </ProfileButton>
        </div>
      </main>
      <div className="bg-secondary b flex h-full w-full items-center justify-center rounded-l-xl">
        <Image
          src="/images/logo.png"
          className="w-1/2 opacity-10"
          alt="Logo"
          width={1000}
          height={1000}
        />
      </div>
    </div>
  );
};

const ProfileButton = ({
  className,
  ...props
}: ComponentProps<typeof Button>) => {
  return (
    <Button
      variant="secondary"
      className={cn(className, "cursor-pointer rounded-full")}
      size={"lg"}
      {...props}
    />
  );
};

export default HomePage;
