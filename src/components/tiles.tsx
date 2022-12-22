import React from "react";
import { useAppState } from "@/hooks";
import Tile from "@/components/tile";

type Props = {
  id: number;
  zoom: number;
};

export default function Tiles({ id, zoom }: Props) {
  const focus = useAppState((state) => state.focus);
  const sizes = useAppState((state) => state.sizes);
  const grid = useAppState((state) => state.grid);

  if (sizes.length === 0 || grid.length === 0) {
    return null;
  }

  return (
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
  );
}
