export type AppState = {
  zoom: number;
  setZoom: (zoom: AppState["zoom"]) => void;
  focus: number;
  setFocus: (focus: AppState["focus"]) => void;
  rotation: number;
  setRotation: (rotation: AppState["rotation"]) => void;
  measuring: boolean;
  setMeasuring: (measuring: AppState["measuring"]) => void;
  points: Point[][];
  setPoints: (points: AppState["points"]) => void;
  sizes: Size[];
  setSizes: (sizes: AppState["sizes"]) => void;
  grid: Grid;
  setGrid: (grid: AppState["grid"]) => void;
};

export type Tile = {
  w: number;
  h: number;
  x: number;
  y: number;
  col: number;
  row: number;
};

export type Grid = Tile[][][][];

export type Size = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};
