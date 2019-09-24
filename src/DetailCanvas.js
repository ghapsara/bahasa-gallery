import React, { useMemo } from 'react';
import { createCanvas, getPixelRatio } from "./utlis";
import * as THREE from 'three';
import fontJson from './font/helvetica.json';

const WIDTH = window.innerWidth;
const COLOR = '#ff8000';

const FONT = new THREE.FontLoader().parse(fontJson);

function DetailCanvas() {
  const w = 1.3;

  const canvas = useMemo(() => {
    const H = WIDTH * w;

    const canvas = createCanvas(WIDTH, H);
    const context = canvas.getContext('2d');

    const fontSize = 0.15 * WIDTH;

    const pixelRatio = getPixelRatio();

    const width = WIDTH * pixelRatio;
    const height = H * pixelRatio;

    context.beginPath();
    context.strokeStyle = COLOR;
    context.lineWidth = 20;
    context.strokeRect(0, 0, width, height);

    context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillStyle = COLOR;
    context.fillText('Maps', width * 0.5, height * 0.5);

    return canvas;
  }, [w]);

  const textGeometry = new THREE.TextGeometry('text', {
    font: FONT,
    size: 1,
    height: 0
  }).center();

  return (
    <>
      <mesh scale={[3, 3, 3]}>
        <meshBasicMaterial attach="material">
          <canvasTexture attach="map" image={canvas} />
        </meshBasicMaterial>
        <planeBufferGeometry attach="geometry" args={[1, w, 0]} />
      </mesh>
      <mesh geometry={textGeometry}>
        <meshBasicMaterial attach="material" color={COLOR} />
      </mesh>
    </>
  )
}

export default DetailCanvas;