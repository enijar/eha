import React from "react";
import create from "zustand";
import { AppState, Grid, Size } from "@/types";
import { CDN_URL, SCALE } from "@/consts";

export const useAppState = create<AppState>((set) => {
  return {
    zoom: 0,
    setZoom(zoom) {
      set({ zoom });
    },
    focus: 0,
    setFocus(focus) {
      set({ focus });
    },
    rotation: 0,
    setRotation(rotation) {
      set({ rotation });
    },
    measuring: false,
    setMeasuring(measuring) {
      set({ measuring });
    },
    points: [],
    setPoints(points) {
      set({ points });
    },
    sizes: [],
    setSizes(sizes) {
      set({ sizes });
    },
    grid: [],
    setGrid(grid) {
      set({ grid });
    },
  };
});

export function useHotkeys() {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const state = useAppState.getState();
      if (key === "r") {
        state.setRotation((state.rotation + 5) % 360);
      }
      if (key === "m") {
        state.setMeasuring(!state.measuring);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}

export function useTiles(id: number) {
  const setSizes = useAppState((state) => state.setSizes);
  const setGrid = useAppState((state) => state.setGrid);

  React.useEffect(() => {
    fetch(`${CDN_URL}/${id}/tiles.json`)
      .then((res) => res.json())
      .then((tiles) => {
        const sizes: Size[] = [];
        const grid: Grid = [];
        for (let i = 0, length = tiles.length; i < length; i++) {
          const tile = tiles[i];
          if (grid[tile.z] === undefined) {
            grid[tile.z] = [];
          }
          if (grid[tile.z][tile.f] === undefined) {
            grid[tile.z][tile.f] = [];
          }
          if (grid[tile.z][tile.f][tile.y] === undefined) {
            grid[tile.z][tile.f][tile.y] = [];
          }
          grid[tile.z][tile.f][tile.y].push({
            ...tile,
            w: tile.w * SCALE,
            h: tile.h * SCALE,
          });
        }
        for (let zoom = 0, zooms = grid.length; zoom < zooms; zoom++) {
          for (
            let focus = 0, focuses = grid[zoom].length;
            focus < focuses;
            focus++
          ) {
            let height = 0;
            let lastY = 0;
            for (
              let row = 0, rows = grid[zoom][focus].length;
              row < rows;
              row++
            ) {
              let width = 0;
              let lastX = 0;
              for (
                let col = 0, cols = grid[zoom][focus][row].length;
                col < cols;
                col++
              ) {
                const tile = grid[zoom][focus][row][col];
                grid[zoom][focus][row][col] = {
                  w: tile.w,
                  h: tile.h,
                  x: lastX,
                  y: lastY,
                  col: tile.x,
                  row: tile.y,
                };
                lastX += grid[zoom][focus][row][col].w;
                width += grid[zoom][focus][row][col].w;
              }
              lastY += grid[zoom][focus][row][0].h;
              height += grid[zoom][focus][row][0].h;
              sizes[zoom] = { width, height };
            }
          }
        }
        setSizes(sizes);
        setGrid(grid);
      })
      .catch((err) => console.error(err));
  }, [id]);
}
