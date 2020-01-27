import React, { useMemo, useRef, useCallback, useState } from 'react'
import { geoMercator, geoPath, map } from 'd3';
import { feature } from 'topojson-client';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { a, useSpring, interpolate } from 'react-spring/three';
import random from 'canvas-sketch-util/random';
import { mapRange, lerp } from 'canvas-sketch-util/math';
import { chunk } from 'lodash-es';
import { createCanvas } from './utlis';
import { COLOR, PIXEL_RATIO, SCROLL_VIEW_HEIGHT, SCROLL_VIEW_WIDTH, WIDTH, HEIGHT, COLORS, BACKGROUND_COLOR, DOPE, SCROLL_HEIGHT } from './constants';
import { maps as mapsData } from './maps/index.js';

function Painting({ maps, mapsKey, ...props }) {
  const canvas = useMemo(() => {
    const height = window.innerWidth;
    const width = height * 1.5;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const w = width * PIXEL_RATIO;
    const h = height * PIXEL_RATIO;

    const sw = w * 0.8;
    const sh = h * 0.6;

    context.beginPath();
    context.fillStyle = props.color;
    context.fillRect(0, 0, w, h);

    context.beginPath();
    context.strokeStyle = props.color;
    context.lineWidth = 30;
    context.strokeRect(0, 0, w, h);


    const font = `bold 150px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = "white";
    context.fillText(mapsKey.replace("-", " "), w * 0.5, h * 0.9);
    // context.fillText(props.color, w * 0.5, h * 0.9);

    const f = feature(maps, maps.objects[mapsKey]);
    const projection = geoMercator().fitSize([sw, sh], f);

    const path = geoPath(projection, context);

    context.translate(w * 0.1, h * 0.2);

    context.beginPath();
    context.fillStyle = "white";
    path(f);
    context.fill();

    return canvas;
  }, [maps, mapsKey, props.color]);

  return (
    <mesh {...props}>
      <meshBasicMaterial attach="material" transparent>
        <canvasTexture attach="map" image={canvas} />
      </meshBasicMaterial>
      <planeBufferGeometry attach="geometry" args={[1.5, 1, 1]} />
    </mesh>
  );
}

function Text() {
  const { size } = useThree();
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
    context.fillStyle = "#34363a";
    context.fillText("Galeri Bahasa", 0, h * 0.4);

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

function Gallery({ top, left, setScroll }) {
  const e = Object.keys(mapsData);
  const m = chunk(e, 6);

  const w = 20;
  const w0 = -w;
  const w1 = w;

  const sphereRadius = 3;

  const maps = useMemo(() => {
    return m.map((d, i) => {
      const x = mapRange(i, 0, m.length - 1, w0 + 5, w1 - 5);

      const child = d.map(key => {
        const r = random.insideSphere(sphereRadius);

        return [...r, key];
      });

      return {
        parent: [x, 0, 0],
        child,
      }
    });
  }, [m, w0, w1]);

  const positionRef = useRef(false);

  const [{ y }, set] = useSpring(() => ({
    to: {
      y: 0,
    }
  }));

  const onClick = useCallback((position) => {
    return () => {
      const [p, c] = position;
      let [x, y, z] = c;

      const zScroll = mapRange((z - 4) * -1, 0, 7, 0, SCROLL_VIEW_HEIGHT);
      const xScroll = mapRange(p[0] + x, w0, w1, 0, SCROLL_VIEW_WIDTH);

      if (positionRef.current) {
        set({
          y: 0,
        });

        setScroll(xScroll, 0);
      } else {
        setScroll(xScroll, zScroll);

        y = y * -1;
        set({ y });
      }

      positionRef.current = !positionRef.current;
    }
  }, [set, setScroll, w0, w1]);

  return (
    <a.group
      position={interpolate([left, top, y], (l, t, y) => {
        const x = mapRange(l, 0, SCROLL_VIEW_WIDTH, w1, w0);
        const z = mapRange(t, 0, SCROLL_VIEW_HEIGHT, 0, 7);

        return [x, y, z];
      })}
    >
      {maps.map((d, i) => {
        return (
          <group key={i} position={d.parent}>
            {d.child.map((c, j) => {
              const [x, y, z, mapsKey] = c;
              const colorIndex = (i * 6) + j;

              return (
                <Painting
                  key={mapsKey}
                  position={[x, y, z]}
                  onClick={onClick([d.parent, c])}
                  color={COLORS[colorIndex]}
                  maps={mapsData[mapsKey]}
                  mapsKey={mapsKey}
                />
              )
            }
            )}
          </group>
        )
      })}
    </a.group>
  )
}

export default Gallery;
