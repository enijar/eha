import React from "react";
import * as THREE from "three";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAppState, useHotkeys, useTiles } from "@/hooks";
import Tile from "@/components/tile";
import { OFFSET_Z } from "@/consts";
import Points from "@/components/points";

type Props = {
  id: number;
};

export default function App({ id }: Props) {
  const zoom = useAppState((state) => state.zoom);
  const focus = useAppState((state) => state.focus);
  const rotation = useAppState((state) => state.rotation);
  const sizes = useAppState((state) => state.sizes);
  const grid = useAppState((state) => state.grid);

  useHotkeys();

  useTiles(id);

  useFrame(({ camera }) => {
    if (sizes.length === 0) return;
    camera.rotation.set(0, 0, THREE.MathUtils.degToRad(rotation));
    if (camera.position.z <= 10 / Math.pow(2, zoom + 1)) {
      // console.log("increment zoom");
    }
    const max = OFFSET_Z;
    const min = OFFSET_Z / Math.pow(2, sizes.length - 1);
    const z = Math.ceil(
      THREE.MathUtils.mapLinear(
        camera.position.z,
        max,
        min,
        0,
        sizes.length - 1
      )
    );
    // const e = OFFSET_Z / Math.pow(2, OFFSET_Z - camera.position.z);
    // console.log(e);
  });

  if (sizes.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <color args={["#333333"]} attach="background" />
      <PerspectiveCamera
        makeDefault
        position={[0, 0, OFFSET_Z]}
        rotation-z={THREE.MathUtils.degToRad(rotation)}
      />
      <OrbitControls
        makeDefault
        enableRotate={false}
        enableDamping={false}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.MIDDLE,
          RIGHT: THREE.MOUSE.RIGHT,
        }}
        touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.PAN }}
        minDistance={1}
        maxDistance={OFFSET_Z}
        zoomSpeed={0.25}
      />

      <group
        position-x={sizes[zoom].width * -0.5}
        position-y={sizes[zoom].height * 0.5}
      >
        {grid[zoom][focus].map((cols, rowIndex) => {
          return (
            <React.Fragment key={rowIndex}>
              {cols.map((tile, tileIndex) => {
                return (
                  <React.Fragment key={tileIndex}>
                    <React.Suspense>
                      <Tile id={id} tile={tile} />
                    </React.Suspense>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </group>

      <Points />
    </React.Fragment>
  );
}
