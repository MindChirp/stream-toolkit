import { cn } from "@/lib/utils";
import { Instance, Instances, OrbitControls } from "@react-three/drei";
import {
  Canvas,
  useFrame,
  useLoader,
  type ThreeElements,
} from "@react-three/fiber";
import { ComponentProps, Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three-stdlib";

const deg = (v = 0) => (v * Math.PI) / 180;

export const Rocket1 = ({
  pitch = 0,
  yaw = 0,
  roll = 0,
  damping = 12, // higher = snappier; lower = floatier
  scale = 0.001,
}: {
  pitch?: number;
  yaw?: number;
  roll?: number;
  damping?: number;
  scale?: number;
}) => {
  const geom = useLoader(STLLoader, "/models/rocket.stl");

  // Group that we rotate with a quaternion
  const ref = useRef<THREE.Group>(null!);

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

  // (Optional) center the geometry so rotations feel right
  // You can pre-center once to avoid doing it per frame:
  useMemo(() => {
    geom.computeBoundingBox();
    geom.center();
  }, [geom]);

  return (
    <Suspense fallback={null}>
      <group ref={ref} position={[0, 0, 0]} scale={scale}>
        <mesh geometry={geom}>
          <meshPhongMaterial color="#ffffff" />
        </mesh>
      </group>
    </Suspense>
  );
};

export const Rocket = ({
  pitch,
  yaw,
  roll,
}: {
  pitch?: number;
  yaw?: number;
  roll?: number;
}) => {
  const stl = useLoader(STLLoader, "/models/rocket.stl");

  return (
    <Suspense fallback="Loading">
      <mesh
        scale={0.001}
        rotation={[
          ((Math.PI / 180) * (pitch ?? 0)) % 360,
          ((Math.PI / 180) * (yaw ?? 0)) % 360,
          ((Math.PI / 180) * (roll ?? 0)) % 360,
        ]}
        position={[0, 0, 0]}
      >
        <meshPhongMaterial color="#ffffff" />
        <mesh>
          <primitive object={stl} attach="geometry" />
        </mesh>
      </mesh>
    </Suspense>
  );
};

const RingRadius = 3;

const AxisRing = ({ ...props }: ThreeElements["mesh"]) => {
  return (
    <>
      <mesh {...props}>
        <ringGeometry args={[RingRadius - 0.05, RingRadius, 64]} />
        <meshBasicMaterial side={THREE.DoubleSide} color="#aaaaaa" />
      </mesh>

      <polarGridHelper args={[RingRadius, 4, 10, 1]} rotation={[0, 0, 0]}>
        <lineBasicMaterial color="white" opacity={0.5} transparent />
      </polarGridHelper>
    </>
  );
};

type NavballProps = {
  pitch?: number;
  yaw?: number;
  roll?: number;
} & ComponentProps<"div">;
const Navball = ({ pitch, yaw, roll, className, ...props }: NavballProps) => {
  return (
    <div
      className={cn(
        "relative h-[9.5rem] w-[9.5rem] overflow-hidden rounded-full bg-black/50",
        className,
      )}
      {...props}
    >
      <div className="absolute top-0 left-0 h-full w-full rounded-full border border-[#aaaaaa] bg-gradient-to-b from-black to-transparent" />

      <Canvas
        className="h-full"
        orthographic
        camera={{
          position: [-10, 5, -10],
          zoom: 25,
        }}
      >
        <ambientLight intensity={10} />
        <AxisRing rotation={[Math.PI / 2, 0, 0]} />
        <OrbitControls />

        <Rocket1 pitch={(pitch ?? 0) - 90} yaw={yaw} roll={roll} />
      </Canvas>
    </div>
  );
};

/**
 * Pointy-top axial layout:
 * x = size * sqrt(3) * (q + r/2)
 * z = size * 1.5 * r
 */
function HexGridCircle({
  R = 5, // circle radius
  size = 0.25, // hex radius (center -> vertex)
  y = 0, // vertical offset of the grid in world space
  color = "#3aa3ff",
}: {
  R?: number;
  size?: number;
  y?: number;
  color?: THREE.ColorRepresentation;
}) {
  const centers = useMemo(() => {
    const pts: [number, number, number][] = [];
    const w = Math.sqrt(3) * size; // horizontal spacing between centers
    const h = 1.5 * size; // vertical spacing between centers

    // conservative search bounds for axial coords
    const qMax = Math.ceil(R / w) + 2;
    const rMax = Math.ceil(R / h) + 2;

    const keepRadius = Math.max(0, R - size); // ensure whole hex fits inside the circle

    for (let r = -rMax; r <= rMax; r++) {
      for (let q = -qMax; q <= qMax; q++) {
        const x = w * (q + r / 2);
        const z = h * r;
        if (Math.hypot(x, z) <= keepRadius) {
          pts.push([x, y, z]);
        }
      }
    }
    return pts;
  }, [R, size, y]);

  // CircleGeometry(1, 6) is a unit hex disc in XY plane; rotate the whole batch to XZ
  return (
    <group rotation={[0, 0, 0]}>
      <Instances limit={centers.length}>
        <ringGeometry args={[size - 0.1, size - 0.05, 6]} />
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
        {centers.map((p, i) => (
          <Instance key={i} position={p} rotation={[Math.PI / 2, 0, 1]} />
        ))}
      </Instances>
    </group>
  );
}

export default Navball;
