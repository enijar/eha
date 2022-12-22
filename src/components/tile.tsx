import React from "react";
import * as THREE from "three";
import type { Vector3 } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useAppState } from "@/hooks";
import { Tile as TileType } from "@/types";

type Props = {
  id: number;
  tile: TileType;
};

const frustum = new THREE.Frustum();

export default function Tile({ id, tile }: Props) {
  const zoom = useAppState((state) => state.zoom);
  const focus = useAppState((state) => state.focus);

  const meshRef = React.useRef<THREE.Mesh | null>(null);

  const position = React.useMemo<[x: number, y: number, z: number]>(() => {
    const x = tile.x + tile.w * 0.5;
    const y = -tile.y + tile.h * -0.5;
    return [x, y, 0];
  }, [tile]);

  useFrame(({ camera }) => {
    const mesh = meshRef.current;
    if (mesh === null) return;

    frustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
    const visible = frustum.intersectsObject(mesh);

    console.log(visible);
  });

  const texture = useTexture(
    `https://storage.finervision.com/eha-website/${id}/${zoom}-${tile.col}-${tile.row}-${focus}.jpg`
  );

  return (
    <mesh position={position} ref={meshRef}>
      <planeGeometry args={[tile.w, tile.h]} />
      <meshBasicMaterial map={texture} depthWrite={false} depthTest={false} />
    </mesh>
  );
}
