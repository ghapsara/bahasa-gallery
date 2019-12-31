import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useThree } from 'react-three-fiber';
import { a, interpolate } from 'react-spring/three';
import { chunk } from 'lodash-es';
import { mapRange } from 'canvas-sketch-util/math';
import { shuffle } from 'canvas-sketch-util/random';
import * as THREE from 'three';
import { createCanvas, getPixelRatio } from './utlis';
import provinsiBahasa from './data/provinsi-bahasa.json';
// import kabkotBahasa from './data/bahasa-kabkot.json';

// const b = kabkotBahasa.reduce((prev, curr) => {
//   const key = curr.provinsi + "-" + curr.kabkot;
//   return {
//     ...prev,
//     [key]: curr.bahasa
//   }
// }, {});

const pixelRatio = getPixelRatio();

const COLOR = '#FE9B96';

const HEIGHT = window.innerHeight;

const SCROLL_HEIGHT = 5 * HEIGHT;
const SCROLL_VIEW_HEIGHT = SCROLL_HEIGHT - HEIGHT;

const bahasaAll = provinsiBahasa.reduce((prev, curr) => ({
  ...prev,
  [curr.provinsi]: curr.bahasa,
}), {});

const bahasa = bahasaAll["Bali"];

const FONT_SIZE = 500; // size of the window
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

      return [...prev, {
        x,
        text,
        width,
        height,
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

function Text({ x, text, width, height, isInDetail }) {
  const canvas = useMemo(() => {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const h = height * pixelRatio;

    const font = `bold ${FONT_SIZE * 0.95}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillStyle = COLOR;
    context.fillText(text, 0, h * 0.5);

    return canvas;
  }, [text, width, height]);

  const canvasTexture = new THREE.CanvasTexture(canvas);
  canvasTexture.minFilter = THREE.LinearFilter;

  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (isInDetail) {
      setTimeout(() => {
        setOpacity(1)
      }, 1000);
    };
    if (!isInDetail) {
      setOpacity(0);
    }
  }, [isInDetail, opacity, setOpacity]);

  return (
    <mesh position={[x, 0, 0]}>
      <a.meshBasicMaterial attach="material" transparent map={canvasTexture} opacity={opacity} />
      <planeGeometry attach="geometry" args={[width, height, 1]} />
    </mesh>
  );
}

function Bahasa({ top, position, isInDetail }) {
  const { viewport } = useThree();

  const texts = createTextArray(bahasa);

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

  const [x, y, z] = !!position ? position : [0, 0, 0];

  return (
    <group position={[x, y, z - 3]}>
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
              <Text key={i + j} {...t} isInDetail={isInDetail} />
            )}
          </a.group>
        )
      })}
    </group>
  );
}



export default Bahasa;
