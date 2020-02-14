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
    const height = window.innerWidth * 1.4;
    const width = window.innerWidth;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const w = width * PIXEL_RATIO;
    const h = height * PIXEL_RATIO;

    context.beginPath();
    context.fillStyle = props.color;
    context.fillRect(0, h * 0.85, w, h * 0.15);

    context.beginPath();
    context.strokeStyle = props.color;
    context.lineWidth = 30;
    context.strokeRect(0, 0, w, h);

    const font = `bold 200px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font;
    context.fillStyle = "black";
    // context.fillText(mapsKey.replace("-", " ").toUpperCase(), w * 0.05, h * 0.925);
    context.fillText("Title", w * 0.05, h * 0.925);

    const font1 = `100px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font1;
    context.fillStyle = "black";
    context.fillText("5 bahasa", w * 0.05, h * 0.96);
    context.fillText("subtitle", w * 0.05, h * 0.96);

    return canvas;
  }, [props.color]);

  // SEPARATE MAP MESH TO GET THE 3D EFFECT

  const mapCanvas = useMemo(() => {
    const height = window.innerWidth * 1.4;
    const width = window.innerWidth;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const w = width * PIXEL_RATIO;
    const h = height * PIXEL_RATIO;

    const sw = w * 0.8;
    const sh = sw;

    // context.beginPath();
    // context.strokeStyle = "white";
    // context.lineWidth = 10;
    // context.strokeRect(0, 0, w, h);


    context.beginPath();
    context.fillStyle = "white";
    context.fillRect(0, 0, w, h);

    const f = feature(maps, maps.objects[mapsKey]);
    const projection = geoMercator().fitSize([sw, sh], f);

    const path = geoPath(projection, context);

    context.translate(w * 0.1, h * 0.15);

    context.beginPath();
    context.fillStyle = props.color;
    context.fillRect(0, 0, sw, sh);

    // context.beginPath();
    // context.fillStyle = props.color;
    // path(f);
    // context.fill();

    return canvas;
  }, [maps, mapsKey, props.color]);

  const ref = useRef();

  const [{ x, y }, set] = useSpring(() => ({
    x: 0,
    y: 0,
  }));


  // useFrame(({ clock, mouse }) => {
  //   // console.log({ x: mouse.x, y: mouse.y });
  //   set({ x: mouse.x, y: mouse.y });
  // });

  return (
    <group position={props.position}>
      <mesh renderOrder={1} onClick={props.onClick}>
        <meshBasicMaterial attach="material" transparent={true}>
          <canvasTexture attach="map" image={canvas} />
        </meshBasicMaterial>
        <planeBufferGeometry attach="geometry" args={[1, 1.4, 1]} />
      </mesh>

      <a.mesh
        ref={ref}
        renderOrder={0}
        rotation={interpolate([x, y], (x, y) => [y * -0.5, x * 0.5, 0])}
      >
        <meshBasicMaterial attach="material" transparent={true} depthTest={false}>
          <canvasTexture attach="map" image={mapCanvas} />
        </meshBasicMaterial>
        <planeBufferGeometry attach="geometry" args={[1, 1.4, 0]} />
      </a.mesh>
    </group>
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

  const positionRef = useRef(null);
  const activeRef = useRef(false);

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

      if (positionRef.current === position && activeRef.current) {
        set({
          y: 0,
        });

        setScroll(xScroll, 0);
        activeRef.current = false;
      } else {
        setScroll(xScroll, zScroll);

        y = y * -1;
        set({ y });
        activeRef.current = true;
      }

      positionRef.current = position;
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
