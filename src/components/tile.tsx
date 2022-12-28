import React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAppState } from "@/hooks";
import { Tile as TileType } from "@/types";
import { CDN_URL } from "@/consts";

const textureLoader = new THREE.TextureLoader();

type Props = {
  id: number;
  tile: TileType;
};

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

    const visible = useAppState.getState().viewport.box.intersectsBox(box);
    mesh.visible = visible;
    setVisible(visible);
  });

  React.useEffect(() => {
    console.log(`visible(${tile.row},${tile.col}): ${visible}`);
  }, [tile.row, tile.col, visible]);

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
