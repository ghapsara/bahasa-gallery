import React, { useMemo, useCallback } from 'react';
import { useLoader, useThree } from 'react-three-fiber';
import { a } from 'react-spring/three';
import { chunk } from 'lodash-es';
import { mapRange, wrap } from 'canvas-sketch-util/math';
import { shuffle } from 'canvas-sketch-util/random';
import * as THREE from 'three';
import { createCanvas, getPixelRatio } from './utlis';
import provinsiBahasa from './data/provinsi-bahasa.json';
import kabkotBahasa from './data/bahasa-kabkot.json';

// const b = kabkotBahasa.reduce((prev, curr) => {
//   const key = curr.provinsi + "-" + curr.kabkot;
//   return {
//     ...prev,
//     [key]: curr.bahasa
//   }
// }, {});

// console.log(b);

const pixelRatio = getPixelRatio();

const COLOR = '#FE9B96';

const HEIGHT = window.innerHeight;

const SCROLL_HEIGHT = 5 * HEIGHT;
const SCROLL_VIEW_HEIGHT = SCROLL_HEIGHT - HEIGHT;

const bahasaAll = provinsiBahasa.reduce((prev, curr) => ({
  ...prev,
  [curr.provinsi]: curr.bahasa,
}), {});

const bahasa = bahasaAll["Jawa Tengah"];
// const bahasa = bahasaAll["Papua"];

function createTextArray(bahasa, viewport) {
  let a = []
  let bl = bahasa.length;
  for (let i = 0; i < 50; i++) {
    const index = (i % bl);

    a.push(bahasa[index]);
  }

  // const b = chunk(shuffle(a), 10);
  const b = chunk(a, 10);

  const c = b.map(d => {
    const data = d.reduce((prev, curr, i) => {
      const width = curr.length * 195;

      let x0 = 0;
      if (i > 0) {
        prev.forEach(e => {
          x0 += e.width;
        });
      }

      const x = ((width / 2) + x0) * 0.003333;

      return [...prev, {
        x,
        text: curr,
        width,
      }];
    }, []);

    const width = data.reduce((prev, curr) => prev + curr.width, 0);

    const S = viewport.width / 2;
    const X = width * 0.003333;

    return {
      data,
      S,
      X
    }
  });

  return c;
}

function Text({ text, x, width }) {
  const fontSize = 700;
  const height = 400;


  const we = 1;
  const he = height / width;

  const s = width / 300;
  const scale = [s, s, s];
  const position = [x, 0, 0];

  const canvas = useMemo(() => {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const w = width * pixelRatio;
    const h = height * pixelRatio;

    context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    // context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = COLOR;
    context.fillText(text, 0, h * 0.5);

    const a = context.measureText(text).width;

    console.log({ width, a });

    context.beginPath();
    context.strokeStyle = COLOR;
    context.lineWidth = 50;
    context.strokeRect(0, 0, w, h);

    return canvas;
  }, [text, width]);

  return (
    <mesh position={position} scale={scale}>
      <meshBasicMaterial attach="material" transparent>
        <canvasTexture attach="map" image={canvas} />
      </meshBasicMaterial>
      <planeGeometry attach="geometry" args={[we, he, 1]} />
    </mesh>
  );
}

function Bahasa({ top }) {
  const { viewport, size } = useThree();

  console.log(viewport, size);
  const texts = createTextArray(bahasa, viewport);

  const r = [-3, -1.5, 0, 1.5, 3];

  const toRight = useCallback((s0, s1) => {
    return (t) => mapRange(t, 0, SCROLL_VIEW_HEIGHT, s0, -s1 - s0)
  }, []);

  const toLeft = useCallback((s0, s1) => {
    return (t) => mapRange(t, 0, SCROLL_VIEW_HEIGHT, -s1 - s0, s0);
  }, []);

  const x = (viewport.width / 2) * -1;

  return (
    <group scale={[0.5, 0.5, 0.5]} position={[x, 0, 0]}>
      {texts[0].data.map((t, i) => (
        <Text key={i} {...t} />
      ))}
    </group>
  );

  // return (
  //   <>
  //     {texts.map((txt, i) => {
  //       const interp = i === 1 || i === 3 ? toLeft(txt.S, txt.X) : toRight(txt.S, txt.X);
  //       const y = r[i];
  //       return (
  //         <a.group
  //           key={i}
  //           position={top.interpolate(t => {
  //             const x = interp(t);

  //             return [x, y, 0];
  //           })}
  //         >
  //           {txt.data.map((t, j) =>
  //             <Text key={i + j} {...t} />
  //           )}
  //         </a.group>
  //       )
  //     })}
  //   </>
  // );
}



export default Bahasa;
