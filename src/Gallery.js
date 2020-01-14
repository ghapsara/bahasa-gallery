import React, { useMemo, useRef, useCallback, useState } from 'react'
import { COLOR, PIXEL_RATIO, SCROLL_VIEW_HEIGHT, WIDTH, HEIGHT } from './constants';
import { useThree, useFrame } from 'react-three-fiber';
import { a, useSpring, interpolate } from 'react-spring/three';
import random from 'canvas-sketch-util/random';
import { mapRange } from 'canvas-sketch-util/math';
import { chunk, range } from 'lodash-es';
import { createCanvas } from './utlis';

function Paintings({ ...props }) {
  const canvas = useMemo(() => {
    const height = window.innerWidth;
    const width = height * 1.5;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const w = width * PIXEL_RATIO;
    const h = height * PIXEL_RATIO;

    context.beginPath();
    context.strokeStyle = COLOR;
    context.lineWidth = 30;
    context.strokeRect(0, 0, w, h);

    context.beginPath();
    context.fillStyle = COLOR;
    context.fillRect(w * 0.25, h * 0.25, w * 0.5, h * 0.5);

    return canvas;
  }, []);
  return (
    <mesh {...props}>
      {/* <meshBasicMaterial attach="material" color={COLOR} wireframe={true} /> */}
      <meshBasicMaterial attach="material">
        <canvasTexture attach="map" image={canvas} />
      </meshBasicMaterial>
      <planeBufferGeometry attach="geometry" args={[1.5, 1, 1]} />
    </mesh>
  );
}

function Text() {
  const { size, viewport } = useThree();
  const { width, height } = size;

  const canvas = useMemo(() => {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const w = width * PIXEL_RATIO;
    const h = height * PIXEL_RATIO;

    // context.beginPath();
    // context.strokeStyle = COLOR;
    // context.lineWidth = 30;
    // context.strokeRect(0, 0, w, h);

    const fontSize = 300;
    const font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillStyle = COLOR;
    context.fillText("IIIEOWM", 0, h * 0.4);

    const font1 = `bold ${fontSize * 0.5}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font1;
    context.fillText("123456", 0, (h * 0.5) + fontSize);

    return canvas;
  }, [height, width]);

  const w = width / height;

  const s = 7.5;

  return (
    <mesh scale={[s, s, s]} position={[0, 0, 0]}>
      <meshBasicMaterial attach="material" transparent>
        <canvasTexture attach="map" image={canvas} />
      </meshBasicMaterial>
      <planeBufferGeometry attach="geometry" args={[w, 1, 1]} />
    </mesh>
  )
}

function ButtonExit() {
  return (
    <mesh position={[-3, -3, 0]}>
      <meshBasicMaterial attach="material" color={COLOR} />
      <planeBufferGeometry attach="geometry" args={[1, 1, 1]} />
    </mesh>
  )
}

function Gallery({ top, setScroll }) {
  const n = 33;
  const e = range(n);
  const m = chunk(e, 6);

  // const { viewport: { width } } = useThree();

  const w = 20;
  const w0 = -w;
  const w1 = w;

  const maps = useMemo(() => {
    return m.map((d, i) => {
      const x = mapRange(i, 0, m.length - 1, w0 + 5, w1 - 5);

      const child = d.map(() => {
        const r = random.insideSphere(3);

        return r;
      });

      return {
        parent: [x, 0, 0],
        child,
      }
    });
  }, [m, w0, w1]);

  const positionRef = useRef(false);

  const [{ yz }, set] = useSpring(() => ({
    to: {
      yz: [0, 0],
    }
  }));

  const onClick = useCallback((position) => {
    return () => {
      if (positionRef.current) {
        set({
          yz: [0, 0],
        });
      } else {
        const [p, c] = position;
        let [x, y, z] = c;
        const xP = mapRange(p[0] + x, w0, w1, 0, SCROLL_VIEW_HEIGHT);

        setScroll(xP);

        y = y * -1;
        z = (z - 4) * -1;
        set({
          yz: [y, z],
        });
      }

      positionRef.current = !positionRef.current;
    }
  }, [set, setScroll, w0, w1]);

  return (
    <>
      <Text />
      {/* <ButtonExit /> */}
      <a.group
        position={interpolate([top, yz], (t, [y, z]) => {
          const x = mapRange(t, 0, SCROLL_VIEW_HEIGHT, w1, w0);

          return [x, y, z];
        })}
      >
        {maps.map((d, i) => {
          return (
            <group key={i} position={d.parent}>
              {d.child.map((c, j) =>
                <Paintings key={`${i}-${j}`} position={c} onClick={onClick([d.parent, c])} />
              )}
            </group>
          )
        })}
      </a.group>
    </>
  )
}

export default Gallery;
