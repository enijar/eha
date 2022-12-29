import React from "react";
import * as THREE from "three";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { OFFSET_Z } from "@/consts";
import { useAppState, useHotkeys, useTiles } from "@/hooks";
import Points from "@/components/points";
import Tiles from "@/components/tiles";

type Props = {
  id: number;
};

export default function App({ id }: Props) {
  const zoom = useAppState((state) => state.zoom);
  const setZoom = useAppState((state) => state.setZoom);
  const rotation = useAppState((state) => state.rotation);
  const sizes = useAppState((state) => state.sizes);

  useHotkeys();
  useTiles(id);

  const zoomDistances = React.useMemo(() => {
    const zoomDistances: number[] = [OFFSET_Z];
    for (let i = 1, length = sizes.length; i < length; i++) {
      zoomDistances.push(zoomDistances[zoomDistances.length - 1] / 2);
    }
    return zoomDistances;
  }, [sizes]);

  const scales = React.useMemo(() => {
    const scales: number[] = [1];
    for (let i = 1, length = sizes.length; i < length; i++) {
      scales.push(scales[scales.length - 1] / 2);
    }
    return scales;
  }, [sizes]);

  function closestZoomDistance(
    zoomDistances: number[],
    camera: THREE.Camera
  ): [distance: number, index: number] {
    let zoomDistanceIndex = 0;
    for (let i = 0, length = zoomDistances.length; i < length; i++) {
      const index = Math.max(zoomDistances.length - 1, i + 1);
      const zoomDistance = zoomDistances[i];
      const nextZoomDistance = zoomDistances[index];
      if (
        camera.position.z <= zoomDistance &&
        camera.position.z >= nextZoomDistance
      ) {
        zoomDistanceIndex = i;
      }
    }
    if (camera.position.z === zoomDistances[zoomDistances.length - 1]) {
      zoomDistanceIndex = zoomDistances.length - 1;
    }
    return [zoomDistances[zoomDistanceIndex], zoomDistanceIndex];
  }

  const viewportBox = useThree((state) => state.viewport);

  const viewportPlane = React.useMemo(() => {
    const bleed = 1.5; // ratio where 1 = no bleed, 2 = 2x viewport bleed, etc.
    return new THREE.Mesh(
      new THREE.PlaneGeometry(
        viewportBox.width * bleed,
        viewportBox.height * bleed
      ),
      new THREE.MeshBasicMaterial({
        color: "crimson",
        transparent: true,
        opacity: 0.5,
      })
    );
  }, [viewportBox.width, viewportBox.height]);

  useFrame(({ camera }) => {
    if (sizes.length === 0) return;

    camera.rotation.set(0, 0, THREE.MathUtils.degToRad(rotation));
    const [, zoomDistanceIndex] = closestZoomDistance(zoomDistances, camera);
    if (zoomDistanceIndex !== zoom) {
      setZoom(zoomDistanceIndex);
    }

    const { viewport, setViewport } = useAppState.getState();

    viewportPlane.position.copy(camera.position);
    viewportPlane.position.z = 0;
    const scale = camera.position.z / OFFSET_Z;
    viewportPlane.scale.set(scale, scale, scale);
    viewport.box.setFromObject(viewportPlane);

    setViewport({
      ...viewport,
      x: camera.position.x,
      y: camera.position.y,
      width: viewportBox.width,
      height: viewportBox.height,
    });
  });

  if (sizes.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <color args={["#333333"]} attach="background" />
      <primitive object={viewportPlane} visible={false} />
      <PerspectiveCamera
        makeDefault
        position={[0, 0, OFFSET_Z]}
        rotation-z={THREE.MathUtils.degToRad(rotation)}
      />
      <OrbitControls
        makeDefault
        enableRotate={false}
        enableDamping={false}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.MIDDLE,
          RIGHT: THREE.MOUSE.RIGHT,
        }}
        touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.PAN }}
        minDistance={zoomDistances[zoomDistances.length - 1]}
        maxDistance={OFFSET_Z}
        zoomSpeed={0.25}
      />

      {sizes.map((size, index) => {
        if (index !== zoom) return null;
        const scale = scales[index];
        return (
          <group key={index} scale={scale}>
            <Tiles id={id} zoom={index} />
          </group>
        );
      })}

      <Points />
    </React.Fragment>
  );
}
