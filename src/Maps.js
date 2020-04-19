import React, { useCallback, useMemo } from 'react';
import { useSpring, interpolate, a } from 'react-spring/three';
import { lerp } from 'canvas-sketch-util/math';
import { geoMercator, geoPath } from 'd3';
import { mesh } from 'topojson-client';
import { createCanvas } from './utlis';
import { WIDTH, WIDTH_BY_PIXEL_RATIO, PIXEL_RATIO } from './constants';
import { CanvasTexture, AdditiveBlending, ShaderMaterial } from 'three';

const MaskShader = {
  uniforms: {
    map: { value: null },
    backgroundMask: { value: null },
    textMask: { value: null },
  },
  fragmentShader: `
    varying vec2 vUv;

    uniform sampler2D map;
    uniform sampler2D backgroundMask;
    uniform sampler2D textMask;

    void main() {
      vec3 mapTexture = texture2D(map, vUv).xyz;
      vec3 backgroundMaskTexture = texture2D(backgroundMask, vUv).xyz;
      vec3 textMaskTexture = texture2D(textMask, vUv).xyz;

      gl_FragColor = vec4(mix(backgroundMaskTexture, mapTexture, textMaskTexture), 1.0);
    }
  `,
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
}

function Maps({ topology, geometry, position, name, color, total, onClick }) {
  const sizeH = 1.4;
  const COLOR_1 = 'white';
  const COLOR_2 = color;

  const mapCanvas = useMemo(() => {
    const H = WIDTH * sizeH;

    const canvas = createCanvas(WIDTH, H);
    const context = canvas.getContext('2d');

    const w = WIDTH_BY_PIXEL_RATIO;
    const h = H * PIXEL_RATIO;

    context.beginPath();
    context.fillStyle = COLOR_1;
    context.fillRect(0, 0, w, h);

    const sw = w * 0.8;
    const sh = h * 0.65;

    const m = mesh(topology, geometry);
    const projection = geoMercator().fitSize([sw, sh], m);
    const path = geoPath(projection, context)

    context.translate(w * 0.1, h * 0.1);
    context.beginPath();
    path(m);
    context.fillStyle = COLOR_2;
    context.fill();

    return new CanvasTexture(canvas);
  }, [COLOR_1, geometry, topology]);

  const mapMask = useMemo(() => {
    const H = WIDTH * sizeH;

    const canvas = createCanvas(WIDTH, H);
    const context = canvas.getContext('2d');

    const w = WIDTH_BY_PIXEL_RATIO;
    const h = H * PIXEL_RATIO;

    context.beginPath();
    context.fillStyle = COLOR_2;
    context.fillRect(0, 0, w, h);

    const sw = w * 0.8;
    const sh = h * 0.65;

    const m = mesh(topology, geometry);
    const projection = geoMercator().fitSize([sw, sh], m);
    const path = geoPath(projection, context);

    context.translate(w * 0.1, h * 0.1);

    context.beginPath();
    path(m);
    context.fillStyle = COLOR_1;
    context.fill();

    return new CanvasTexture(canvas);
  }, [COLOR_1, geometry, topology]);


  const textTexture = useMemo(() => {
    const H = WIDTH * sizeH;
    const w = WIDTH_BY_PIXEL_RATIO;
    const h = H * PIXEL_RATIO;

    const canvas = createCanvas(WIDTH, H);
    const context = canvas.getContext('2d');

    const font = (size) => {
      return `bold ${size}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    }

    name.split(" ").forEach((n, i) => {
      context.font = font(400);
      context.fillStyle = COLOR_1;
      context.textAlign = 'left';
      context.textBaseline = 'top';

      const dh = 0.05 + (i * 0.13);
      context.fillText(n, w * 0.05, h * dh);
    });

    context.font = font(1500);
    context.fillStyle = COLOR_1;
    context.textAlign = 'left';
    context.textBaseline = 'bottom';
    context.fillText(total, w * 0.03, h * 0.95);

    context.font = font(300);
    context.fillStyle = COLOR_1;
    context.textAlign = 'left';
    context.textBaseline = 'bottom';
    context.fillText('bahasa', w * 0.05, h * 0.97);

    return new CanvasTexture(canvas);
  }, [name, total]);

  const [{ rX, rY }, set] = useSpring(() => ({ rX: 0.5, rY: 0.5 }));

  const onMouseOut = useCallback(() => {
    set({ rX: 0.5, rY: 0.5 });
  }, [set]);

  const onMouseMove = useCallback(({ uv: { x, y } }) => {
    set({ rX: x, rY: y });
  }, [set]);

  const material = new ShaderMaterial({
    fragmentShader: MaskShader.fragmentShader,
    vertexShader: MaskShader.vertexShader,
    uniforms: {
      map: { value: mapCanvas },
      backgroundMask: { value: mapMask },
      textMask: { value: textTexture },
    },
    blending: AdditiveBlending,
  });

  return (
    <a.mesh
      position={position}
      scale={[1.7, 1.7, 1.7]}
      rotation={interpolate([rX, rY], (x, y) => [lerp(-0.02, 0.08, y), lerp(-0.1, 0.1, x), 0])}
      onPointerOut={onMouseOut}
      onPointerMove={onMouseMove}
      onClick={onClick}
      material={material}
    >
      <planeBufferGeometry attach="geometry" args={[1, sizeH, 1]} />
    </a.mesh>
  )
}

export default Maps;