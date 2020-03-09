import React, { useMemo, useRef, useCallback } from 'react'
import { geoMercator, geoPath } from 'd3';
import { feature } from 'topojson-client';
import { useThree, useFrame } from 'react-three-fiber';
import { a, useSpring, interpolate } from 'react-spring/three';
import { pick, insideSphere } from 'canvas-sketch-util/random';
import { mapRange } from 'canvas-sketch-util/math';
import { chunk } from 'lodash-es';
import { createCanvas } from './utlis';
import { PIXEL_RATIO, SCROLL_VIEW_HEIGHT, SCROLL_VIEW_WIDTH, WIDTH, COLORS, COLOR } from './constants';
import { maps as mapsData } from './maps/index.js';
import provinsiBahasa from './data/provinsi-bahasa.json';
import { Explore } from './Tooltip';

const totalBahasa = provinsiBahasa.reduce((prev, curr) => {
  const key = curr.provinsi.toLowerCase().split(" ").join("-");
  return {
    ...prev,
    [key]: curr.total,
  }
}, {});

// animate position & opacity
function Paintholder({ position, color, ...props }) {
  return (
    <mesh position={position} {...props}>
      <meshBasicMaterial attach="material" color={color} />
      <planeBufferGeometry attach="geometry" args={[1, 1.4, 1]} />
    </mesh>
  );
}

function Painting({ maps, mapsKey, total, ...props }) {
  const canvas = useMemo(() => {
    const height = WIDTH * 1.4;
    const width = WIDTH;
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

    const font = `bold 120px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font;
    context.fillStyle = "black";
    context.fillText(mapsKey.toUpperCase().split("-").join(" "), w * 0.05, h * 0.925);

    const font1 = `100px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font1;
    context.fillStyle = "white";
    context.textBaseline = "middle";
    context.fillText(`${total} bahasa`, w * 0.05, h * 0.96);

    return canvas;
  }, [mapsKey, total, props.color]);

  const mapCanvas = useMemo(() => {
    const width = window.innerWidth;
    const canvas = createCanvas(width, width);
    const context = canvas.getContext('2d');

    const w = width * PIXEL_RATIO;

    const f = feature(maps, maps.objects[mapsKey]);
    const projection = geoMercator().fitSize([w, w], f);

    const path = geoPath(projection, context);

    context.beginPath();
    context.fillStyle = props.color;
    path(f);
    context.fill();

    // context.fillRect(0, 0, w, w);

    return canvas;
  }, [maps, mapsKey, props.color]);

  const ref = useRef();

  const [{ x, y }, set] = useSpring(() => ({
    x: 0,
    y: 0,
  }));

  useFrame(({ mouse }) => {
    set({ x: mouse.x, y: mouse.y });
  });

  const dX = pick([1, -1]);
  const dY = pick([1, -1]);

  return (
    <group position={props.position}>
      <mesh onClick={props.onClick} renderOrder={props.order} >
        <meshBasicMaterial attach="material" depthTest={false}>
          <canvasTexture attach="map" image={canvas} />
        </meshBasicMaterial>
        <planeBufferGeometry attach="geometry" args={[1, 1.4, 1]} />
      </mesh>
      <a.mesh
        renderOrder={props.order}
        ref={ref}
        rotation={interpolate([x, y], (x, y) => [0, 0, 0])}
        position={interpolate([x, y], (x, y) => [x * 0.03 * dX, (y * -0.03 * dY) + 0.1, 0])}
      >
        <meshBasicMaterial attach="material" depthTest={false}>
          <canvasTexture attach="map" image={mapCanvas} />
        </meshBasicMaterial>
        <planeBufferGeometry attach="geometry" args={[0.8, 0.8, 0]} />
      </a.mesh>
    </group>
  );
}

function Text({ position }) {
  const { size } = useThree();
  const { width, height } = size;

  const canvas = useMemo(() => {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const w = width * PIXEL_RATIO;
    const h = height * PIXEL_RATIO;

    const fontSize = 300;
    const font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillStyle = "#34363a";
    context.fillText("Bahasa", 0, h * 0.4);
    context.fillText("Gallery", 0, h * 0.6);

    return canvas;
  }, [width, height]);

  const w = width / height;

  const s = 7.5;

  return (
    <mesh scale={[s, s, s]} position={position}>
      <meshBasicMaterial attach="material" transparent>
        <canvasTexture attach="map" image={canvas} />
      </meshBasicMaterial>
      <planeBufferGeometry attach="geometry" args={[w, 1, 1]} />
    </mesh>
  )
}

function Gallery({ top, left, setScroll, setLocation, setTooltip, tooltipRef }) {
  const e = Object.keys(mapsData);
  const m = chunk(e, 6);

  const w = 20;
  const w0 = -w;
  const w1 = w;

  const sphereRadius = 3;

  const [maps, order] = useMemo(() => {
    const maps = m.map((d, i) => {
      const x = mapRange(i, 0, m.length - 1, w0 + 5, w1 - 5);

      const child = d.map((key) => {
        const r = insideSphere(sphereRadius);

        return [...r, key];
      });

      return {
        parent: [x, 0, 0],
        child,
      }
    });

    const order = maps.reduce((prev, curr) =>
      [
        ...prev,
        ...curr.child.map(c => ({
          key: c[3],
          value: c[2],
        }))
      ],
      []
    )
      .sort((a, b) => a.value - b.value)
      .reduce((prev, curr) => ({
        ...prev,
        [curr.key]: curr.value,
      }), {});

    return [maps, order];
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
      let [x, y, z, key] = c;

      const zScroll = mapRange((z - 3.7) * -1, 0, 7, 0, SCROLL_VIEW_HEIGHT);
      const xScroll = mapRange(p[0] + x, w0, w1, 0, SCROLL_VIEW_WIDTH);

      if (positionRef.current === position && activeRef.current) {
        set({
          y: 0,
        });
        setTooltip(false);
        setScroll(xScroll, 0);

        activeRef.current = false;
        setLocation(key);
      } else {
        setTooltip(true);
        setScroll(xScroll, zScroll);

        y = y * -1;
        set({ y });
        activeRef.current = true;
      }

      positionRef.current = position;
    }
  }, [w0, w1, set, setScroll, setLocation, setTooltip]);

  return (
    <>
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
                    order={order[mapsKey]}
                    total={totalBahasa[mapsKey]}
                  />
                )
              }
              )}
            </group>
          )
        })}
      </a.group>
      <Explore ref={tooltipRef} />
    </>
  )
}

export default Gallery;
