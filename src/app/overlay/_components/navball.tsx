import { Canvas, useLoader, type ThreeElements } from "@react-three/fiber";
import { Suspense, useMemo, type ComponentProps } from "react";
import { STLLoader } from "three-stdlib";
import * as THREE from "three";
import { Instance, Instances, OrbitControls } from "@react-three/drei";

export const Rocket = () => {
  const stl = useLoader(STLLoader, "/models/rocket.stl");
  return (
    <Suspense fallback="Loading">
      <mesh scale={0.001} rotation={[Math.PI, 0, 0]} position={[0, 3, 0]}>
        <meshPhongMaterial color="#ffffff" />
        <primitive object={stl} attach="geometry" />
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

const Navball = () => {
  return (
    <div className="relative h-[9.5rem] w-[9.5rem] overflow-hidden rounded-full bg-black/50">
      <div className="absolute top-0 left-0 h-full w-full rounded-full border border-[#aaaaaa] bg-gradient-to-b from-black to-transparent" />

      <Canvas
        className="h-full"
        orthographic
        camera={{
          position: [5, 5, 5],
          zoom: 25,
        }}
      >
        <ambientLight intensity={10} />
        <AxisRing rotation={[Math.PI / 2, 0, 0]} />
        <OrbitControls />

        <Rocket />
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
