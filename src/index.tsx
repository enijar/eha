import React from "react";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import App from "@/components/app";

const rootElement = document.querySelector("#root");
const root = ReactDOM.createRoot(rootElement!);

root.render(
  <Canvas flat linear legacy gl={{ alpha: false }}>
    <color args={["#333333"]} attach="background" />
    <App id={139} />
  </Canvas>
);
