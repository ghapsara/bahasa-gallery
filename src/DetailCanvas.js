import React, { useMemo, useRef } from 'react';
import { extend, useThree, useRender } from 'react-three-fiber';
import { a } from 'react-spring/three';
import { mapRange, lerp } from 'canvas-sketch-util/math';
import * as THREE from 'three';
import { MaskShader } from './shaders';
import { createCanvas, getPixelRatio } from "./utlis";
import fontJson from './font/helvetica.json';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight * 5;
const COLOR = '#ff8000';
const BACKGROUND_COLOR = '#423c4a';

const MAIN_COLOR = BACKGROUND_COLOR;
const SECONDARY_COLOR = 'white';

function DetailCanvas({ top }) {
  const map = useMemo(() => {
    const canvas = createCanvas(WIDTH, WIDTH);
    const pixelRatio = getPixelRatio();
    const w = WIDTH * pixelRatio;

    const context = canvas.getContext('2d');

    const halfW = w * 0.5;

    context.beginPath();
    context.fillStyle = SECONDARY_COLOR;
    context.fillRect(0, 0, w, w);

    context.beginPath();
    context.fillStyle = MAIN_COLOR;
    context.fillRect(halfW * 0.5, halfW * 0.5, halfW, halfW);

    return new THREE.CanvasTexture(canvas);
  }, []);

  const mask = useMemo(() => {
    const canvas = createCanvas(WIDTH, WIDTH);
    const pixelRatio = getPixelRatio();
    const w = WIDTH * pixelRatio;

    const context = canvas.getContext('2d');

    const halfW = w * 0.5;

    context.beginPath();
    context.fillStyle = MAIN_COLOR;
    context.fillRect(0, 0, w, w);

    context.beginPath();
    context.fillStyle = SECONDARY_COLOR;
    context.fillRect(halfW * 0.5, halfW * 0.5, halfW, halfW);

    return new THREE.CanvasTexture(canvas);
  }, []);

  const text = useMemo(() => {
    const canvas = createCanvas(WIDTH, WIDTH);
    const pixelRatio = getPixelRatio();
    const w = WIDTH * pixelRatio;

    const context = canvas.getContext('2d');

    const fontSize = 0.15 * WIDTH;

    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    // context.textBaseline = 'top';
    context.fillStyle = SECONDARY_COLOR;
    context.fillText('this should be long', w * 0.6, w * 0.5);

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <>
      <mesh>
        <planeGeometry attach="geometry" args={[5, 5, 5]} />
        <a.shaderMaterial
          attach="material"
          args={[MaskShader]}
          uniforms-map-value={map}
          uniforms-backgroundMask-value={mask}
          uniforms-textMask-value={text}
          uniforms-top-value={top.interpolate([0, HEIGHT], [0.0, 1.0])}
          blending={THREE.AdditiveBlending}
          transparent
        />
      </mesh>
    </>
  )
}

export default DetailCanvas;