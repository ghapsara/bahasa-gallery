import React, { useMemo, useCallback, useEffect } from 'react';
import { useThree } from 'react-three-fiber';
import { a, interpolate } from 'react-spring/three';
import { chunk } from 'lodash-es';
import { mapRange } from 'canvas-sketch-util/math';
import { shuffle, pick } from 'canvas-sketch-util/random';
import * as THREE from 'three';
import { createCanvas } from './utlis';
import { PIXEL_RATIO, SCROLL_VIEW_HEIGHT, COLORS } from './constants';
import { bahasaAll } from './data';

const FONT_SIZE = 500;
const FONT = `bold ${FONT_SIZE}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;

function createTextArray(bahasa) {
  const height = FONT_SIZE * 0.5;

  const bhs = shuffle(bahasa);
  const bhsl = bahasa.length;

  const a = []
  for (let i = 0; i < 50; i++) {
    const index = (i % bhsl);

    a.push(bhs[index]);
  }

  const b = chunk(a, 10);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = FONT;

  const c = b.map(d => {
    const data = d.reduce((prev, text, i) => {
      const width = context.measureText(text).width / 2;

      let x = 0;
      prev.forEach((p) => {
        x += p.width;
      });

      x = x + (width / 2);

      const color = pick(COLORS);

      return [...prev, {
        x,
        text,
        width,
        height,
        color,
      }];
    }, []);

    const width = data.reduce((prev, curr) => prev + curr.width, 0);

    return {
      data,
      width
    };
  });

  return c;
}

function Text({ x, text, width, height, color }) {
  const canvas = useMemo(() => {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const h = height * PIXEL_RATIO;

    const font = `bold ${FONT_SIZE * 0.95}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillStyle = color;
    context.fillText(text, 0, h * 0.5);

    return canvas;
  }, [text, width, height, color]);

  const canvasTexture = new THREE.CanvasTexture(canvas);
  canvasTexture.minFilter = THREE.LinearFilter;

  return (
    <mesh position={[x, 0, 0]}>
      <a.meshBasicMaterial attach="material" transparent map={canvasTexture} />
      <planeGeometry attach="geometry" args={[width, height, 1]} />
    </mesh>
  );
}

function Bahasa({ top, province, city, setTooltip }) {
  const { viewport } = useThree();

  const texts = useMemo(() => {
    const p = province.split("-").map(d => d[0].toUpperCase() + d.slice(1)).join(' ');
    const location = `${p}-${city}`;

    const bahasa = bahasaAll[location];
    if (bahasa) {
      return createTextArray(bahasa);
    }
    return [];
  }, [province, city]);

  const vw = viewport.width;
  const s = 0.005;
  const r = [-3, -1.5, 0, 1.5, 3];

  const toLeft = useCallback((width) => {
    return (t) => {
      return mapRange(t, 0, SCROLL_VIEW_HEIGHT, vw, (-width * s) - vw);
    }
  }, [vw]);

  const toRight = useCallback((width) => {
    return (t) => {
      return mapRange(t, 0, SCROLL_VIEW_HEIGHT, (-width * s) - vw, vw);
    }
  }, [vw]);

  useEffect(() => {
    setTooltip("scroll", true);
  }, [setTooltip]);

  return (
    <group>
      {texts.map((txt, i) => {
        const { data, width } = txt;
        const interp = i === 1 || i === 3 ? toLeft(width) : toRight(width);
        const y = r[i];

        return (
          <a.group
            key={i}
            position={interpolate([top], (t) => {
              const x = interp(t);

              return [x, y, 0];
            })}
            scale={[s, s, s]}
          >
            {data.map((t, j) =>
              <Text key={i + j} {...t} />
            )}
          </a.group>
        )
      })}
    </group>
  );
}

export default Bahasa;
