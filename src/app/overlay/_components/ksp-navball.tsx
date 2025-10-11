import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import Image from "next/image";
import { Suspense, useMemo, useRef } from "react";
import { TextureLoader } from "three";

import * as THREE from "three";

const deg = (v = 0) => (v * Math.PI) / 180;

const KSPNavball = ({
  pitch = 0,
  yaw = 0,
  roll = 0,
  damping = 12, // higher = snappier; lower = floatier
}: {
  pitch?: number;
  yaw?: number;
  roll?: number;
  damping?: number;
}) => {
  return (
    <div className="relative h-[9.5rem] w-[9.5rem] overflow-hidden rounded-full bg-black/50">
      <Image
        src="/images/ksp-navball-crosshair.png"
        alt="Crosshair"
        height={100}
        width={100}
        className="absolute top-1/2 left-1/2 z-10 w-20 -translate-x-1/2 -translate-y-[0.325rem]"
      />
      <Canvas
        orthographic
        camera={{
          zoom: 75,
        }}
      >
        <OrbitControls />
        <Ball pitch={pitch} roll={roll} yaw={yaw} />
      </Canvas>
    </div>
  );
};

const Ball = ({
  pitch = 0,
  yaw = 0,
  roll = 0,
  damping = 12, // higher = snappier; lower = floatier
}: {
  pitch?: number;
  yaw?: number;
  roll?: number;
  damping?: number;
}) => {
  const texture = useLoader(TextureLoader, "/images/ksp-navball.png");

  const ref = useRef<THREE.Mesh>(null);
  // Recompute the target quaternion whenever inputs change.
  // Mapping: pitch->X, yaw->Y, roll->Z (THREE default order 'XYZ').
  const targetQuat = useMemo(() => {
    const e = new THREE.Euler(deg(pitch), deg(yaw), deg(roll), "XYZ");
    const q = new THREE.Quaternion();
    q.setFromEuler(e);
    return q;
  }, [pitch, yaw, roll]);

  // Smoothly steer the current quaternion toward the target every frame.
  useFrame((_, delta) => {
    if (!ref.current) return;
    // Convert a time-based damping constant to a frame-appropriate alpha
    const alpha = 1 - Math.exp(-damping * delta);
    ref.current.quaternion.slerp(targetQuat, alpha);
  });

  return (
    <Suspense>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </Suspense>
  );
};

export default KSPNavball;
