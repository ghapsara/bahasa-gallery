import React, { useMemo } from 'react';
import { geoMercator, geoPath } from 'd3';
import { feature } from 'topojson-client';
import { createCanvas } from './utlis';
import {
  WIDTH,
  WIDTH_BY_PIXEL_RATIO,
  PIXEL_RATIO,
  COLOR
} from './constants';

function MainMaps({ map, position, name }) {
  const canvas = useMemo(() => {
    const H = WIDTH * 0.7;
    const w = WIDTH_BY_PIXEL_RATIO;
    const h = H * PIXEL_RATIO;

    const sw = w;
    const sh = h;

    const f = feature(map, map.objects[name]);
    const projection = geoMercator().fitSize([sw, sh], f);

    const canvas = createCanvas(WIDTH, H);
    const context = canvas.getContext('2d');

    const path = geoPath(projection, context);

    context.beginPath();
    context.strokeStyle = COLOR;
    context.lineWidth = 10;
    path(f);
    context.stroke();

    return canvas;
  }, [map, name]);

  return (
    <mesh position={position} scale={[1.5, 1.5, 1.5]}>
      <meshBasicMaterial attach="material" transparent>
        <canvasTexture attach="map" image={canvas} />
      </meshBasicMaterial>
      <planeBufferGeometry attach="geometry" args={[1, 0.7, 1]} />
    </mesh>
  )
}

export default MainMaps;