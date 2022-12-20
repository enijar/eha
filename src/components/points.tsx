import React from "react";
import { Line } from "@react-three/drei";
import { useAppState } from "@/hooks";
import { Point } from "@/types";

export default function Points() {
  const measuring = useAppState((state) => state.measuring);
  const points = useAppState((state) => state.points);
  const setPoints = useAppState((state) => state.setPoints);
  const sizes = useAppState((state) => state.sizes);

  const [point, setPoint] = React.useState<Point>(() => {
    return { x: 0, y: 0 };
  });

  if (!measuring || sizes.length === 0) {
    return null;
  }

  return (
    <>
      <mesh
        visible={false}
        scale={sizes[0].width / sizes[sizes.length - 1].width}
        onPointerMove={(event) => {
          setPoint({ x: event.point.x, y: event.point.y });
        }}
        onPointerDown={(event) => {
          const last = points[points.length - 1];
          if (last === undefined) {
            return setPoints([[{ x: event.point.x, y: event.point.y }]]);
          }
          if (last.length === 2) {
            return setPoints([
              ...points,
              [{ x: event.point.x, y: event.point.y }],
            ]);
          }
          if (last.length === 1) {
            points[points.length - 1].push({
              x: event.point.x,
              y: event.point.y,
            });
            return setPoints([...points]);
          }
        }}
      >
        <planeGeometry
          args={[sizes[sizes.length - 1].width, sizes[sizes.length - 1].height]}
        />
        <meshBasicMaterial
          color="crimson"
          depthWrite={false}
          depthTest={false}
          transparent={true}
          opacity={0.5}
        />
      </mesh>

      <mesh position-x={point.x} position-y={point.y}>
        <circleGeometry args={[0.05, 32, 32]} />
        <meshBasicMaterial
          color="blue"
          depthWrite={false}
          depthTest={false}
          transparent={true}
        />
      </mesh>

      {points.map((points, index) => {
        const pointsForLine = points.map<[number, number, number]>((point) => {
          return [point.x, point.y, 0];
        });
        if (pointsForLine.length === 1) {
          pointsForLine.push([point.x, point.y, 0]);
        }
        return (
          <React.Fragment key={index}>
            {points.map((point, index) => {
              return (
                <mesh key={index} position-x={point.x} position-y={point.y}>
                  <circleGeometry args={[0.05, 32, 32]} />
                  <meshBasicMaterial
                    color="blue"
                    depthWrite={false}
                    depthTest={false}
                    transparent={true}
                  />
                </mesh>
              );
            })}
            <Line points={pointsForLine} />
          </React.Fragment>
        );
      })}
    </>
  );
}
