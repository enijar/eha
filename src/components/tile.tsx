import React from "react";
import type { Vector3 } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useAppState } from "@/hooks";
import { Tile as TileType } from "@/types";

type Props = {
  id: number;
  tile: TileType;
};

export default function Tile({ id, tile }: Props) {
  const zoom = useAppState((state) => state.zoom);
  const focus = useAppState((state) => state.focus);

  const texture = useTexture(
    `https://storage.finervision.com/eha-website/${id}/${zoom}-${tile.col}-${tile.row}-${focus}.jpg`
  );

  const position = React.useMemo<Vector3>(() => {
    const x = tile.x + tile.w * 0.5;
    const y = -tile.y + tile.h * -0.5;
    return [x, y, 0];
  }, [tile]);

  return (
    <mesh position={position}>
      <planeGeometry args={[tile.w, tile.h]} />
      <meshBasicMaterial map={texture} depthWrite={false} depthTest={false} />
    </mesh>
  );
}
