import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useAppState } from "@/hooks";
import { AppState, Tile as TileType } from "@/types";
import { CDN_URL } from "@/consts";

const textureLoader = new THREE.TextureLoader();

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

  const meshRef = React.useRef<THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial
  > | null>(null);

  const position = React.useMemo<[x: number, y: number, z: number]>(() => {
    const x = tile.x + tile.w * 0.5;
    const y = -tile.y + tile.h * -0.5;
    return [x, y, 0];
  }, [tile]);

  const box = React.useMemo(() => {
    return new THREE.Box3();
  }, []);

  const [visible, setVisible] = React.useState(false);

  // @todo check if this tile is visible by the camera
  useFrame(({ camera }) => {
    const mesh = meshRef.current;
    if (mesh === null) return;

    box.setFromObject(mesh);

    const { viewport } = useAppState.getState();

    const visible = tileInViewport(tile, box, mesh, viewport);
    mesh.visible = visible;
    setVisible(visible);
  });

  React.useEffect(() => {
    if (!visible) return;
    textureLoader
      .loadAsync(
        `${CDN_URL}/${id}/${zoom}-${tile.col}-${tile.row}-${focus}.jpg`
      )
      .then((texture) => {
        const mesh = meshRef.current;
        if (mesh === null) return;
        mesh.material.map = texture;
        mesh.material.needsUpdate = true;
      });
  }, [visible, id, zoom, tile, focus]);

  return (
    <mesh position={position} ref={meshRef}>
      <planeGeometry args={[tile.w, tile.h]} />
      <meshBasicMaterial depthWrite={false} depthTest={false} />
    </mesh>
  );
}
