import React, { useMemo, useRef } from 'react';
import { extend, useThree, useRender } from 'react-three-fiber';
import * as THREE from 'three';
import { MaskShader } from './shaders';
import { createCanvas, getPixelRatio } from "./utlis";
import fontJson from './font/helvetica.json';

const WIDTH = window.innerWidth;
const COLOR = '#ff8000';

function DetailCanvas() {
  const canvas1 = useMemo(() => {
    const canvas = createCanvas(WIDTH, WIDTH);
    const pixelRatio = getPixelRatio();
    const w = WIDTH * pixelRatio;

    const context = canvas.getContext('2d');

    const halfW = w * 0.5;

    context.beginPath();
    context.fillStyle = 'white';
    context.fillRect(0, 0, w, w);

    context.beginPath();
    context.fillStyle = 'red';
    context.fillRect(halfW * 0.5, halfW * 0.5, halfW, halfW);

    context.beginPath();
    context.lineWidth = 20;
    context.strokeStyle = 'red';
    context.strokeRect(0, 0, w, w);

    return canvas;
  }, []);

  const canvas2 = useMemo(() => {
    const canvas = createCanvas(WIDTH, WIDTH);
    const pixelRatio = getPixelRatio();
    const w = WIDTH * pixelRatio;

    const context = canvas.getContext('2d');

    context.beginPath();
    context.lineWidth = 20;
    context.strokeStyle = 'white';
    context.strokeRect(0, 0, w, w);


    const fontSize = 0.15 * WIDTH;

    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillStyle = COLOR;
    context.fillText('this should be long', w * 0.6, w * 0.5);

    return canvas;
  }, []);

  const map = new THREE.CanvasTexture(canvas1);
  const mask = new THREE.CanvasTexture(canvas2);

  return (
    <>
      <mesh>
        <planeGeometry attach="geometry" args={[5, 5, 5]} />
        <shaderMaterial
          attach="material"
          args={[MaskShader]}
          uniforms-map-value={map}
          uniforms-mask-value={mask}
          blending={THREE.AdditiveBlending}
          transparent
        />
      </mesh>
    </>
  )
}

export default DetailCanvas;