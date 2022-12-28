import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useAppState } from "@/hooks";
import { AppState, Tile as TileType } from "@/types";
import { CDN_URL } from "@/consts";

type Props = {
  id: number;
  tile: TileType;
};

function tileInViewport(
  tile: TileType,
  box: THREE.Box3,
  mesh: THREE.Mesh,
  viewport: AppState["viewport"]
): boolean {
  // return true;
  // if (mesh.geometry.boundingBox === null) {
  //   mesh.geometry.computeBoundingBox();
  // }
  // if (mesh.geometry.boundingBox === null) {
  //   return false;
  // }
  // console.log(mesh.geometry.boundingBox.min.x, viewport.x);
  return viewport.box.intersectsBox(box);
}

export default function Tile({ id, tile }: Props) {
  const zoom = useAppState((state) => state.zoom);
  const focus = useAppState((state) => state.focus);

  const meshRef = React.useRef<THREE.Mesh | null>(null);

  const position = React.useMemo<[x: number, y: number, z: number]>(() => {
    const x = tile.x + tile.w * 0.5;
    const y = -tile.y + tile.h * -0.5;
    return [x, y, 0];
  }, [tile]);

  const box = React.useMemo(() => {
    return new THREE.Box3();
  }, []);

  // @todo check if this tile is visible by the camera
  useFrame(({ camera }) => {
    const mesh = meshRef.current;
    if (mesh === null) return;

    box.setFromObject(mesh);

    const { viewport } = useAppState.getState();

    const visible = tileInViewport(tile, box, mesh, viewport);
    mesh.visible = visible;

    console.log(`visible(${tile.col}-${tile.row}): ${visible}`);

    // calc bounding box
    // test if intersects with viewport

    // @todo old, not accurate, remove when a more accurate solution is implemented
    // frustum.setFromProjectionMatrix(
    //   new THREE.Matrix4().multiplyMatrices(
    //     camera.projectionMatrix,
    //     camera.matrixWorldInverse
    //   )
    // );
    // const visible = frustum.intersectsObject(mesh);
    // if (visible) {
    //   // console.log(`visible: ${tile.col}-${tile.row}`);
    // }
  });

  const texture = useTexture(
    `${CDN_URL}/${id}/${zoom}-${tile.col}-${tile.row}-${focus}.jpg`
  );

  return (
    <mesh position={position} ref={meshRef}>
      <planeGeometry args={[tile.w, tile.h]} />
      <meshBasicMaterial map={texture} depthWrite={false} depthTest={false} />
    </mesh>
  );
}
