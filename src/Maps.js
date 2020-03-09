import React, { useCallback, useMemo } from 'react';
import { useSpring, interpolate, a } from 'react-spring/three';
import { lerp } from 'canvas-sketch-util/math';
import { geoMercator, geoPath } from 'd3';
import { mesh } from 'topojson-client';
import { createCanvas } from './utlis';
import {
  WIDTH,
  COLOR,
  WIDTH_BY_PIXEL_RATIO,
  PIXEL_RATIO
} from './constants';

function Maps({ topology, geometry, position, name, onClick }) {
  const sizeH = 1.3;
  const canvas = useMemo(() => {
    const H = WIDTH * sizeH;

    const canvas = createCanvas(WIDTH, H);
    const context = canvas.getContext('2d');

    const w = WIDTH_BY_PIXEL_RATIO;
    const h = H * PIXEL_RATIO;

    const m = mesh(topology, geometry);

    const sw = w * 0.8;
    const sh = h * 0.65;

    const projection = geoMercator().fitSize([sw, sh], m);
    const path = geoPath(projection, context)

    context.beginPath();
    context.lineWidth = 20;
    context.strokeStyle = COLOR;
    context.strokeRect(0, 0, w, h);

    const fontSize = 0.15 * WIDTH;

    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillStyle = COLOR;
    context.fillText(name, w * 0.5, h * 0.86);

    context.translate(w * 0.1, h * 0.1);

    context.beginPath();
    path(m);
    context.fillStyle = COLOR;
    context.fill();

    return canvas;
  }, [topology, geometry, name, sizeH]);

  const [{ rX, rY }, set] = useSpring(() => ({ rX: 0.5, rY: 0.5 }));

  const onMouseOut = useCallback(() => {
    set({ rX: 0.5, rY: 0.5 });
  }, [set]);

  const onMouseMove = useCallback(({ uv: { x, y } }) => {
    set({ rX: x, rY: y });
  }, [set]);

  return (
    <a.mesh
      position={position}
      scale={[1.5, 1.5, 1.5]}
      rotation={interpolate([rX, rY], (x, y) => [lerp(-0.02, 0.08, y), lerp(-0.1, 0.1, x), 0])}
      onPointerOut={onMouseOut}
      onPointerMove={onMouseMove}
      onClick={onClick}
    >
      <a.meshBasicMaterial attach="material">
        <canvasTexture attach="map" image={canvas} />
      </a.meshBasicMaterial>
      <planeBufferGeometry attach="geometry" args={[1, sizeH, 1]} />
    </a.mesh>
  )
}

export default Maps;