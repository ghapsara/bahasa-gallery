import React, { useMemo, useRef, useCallback, useEffect } from 'react'
import { geoMercator, geoPath } from 'd3';
import { feature } from 'topojson-client';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { a, useSpring, interpolate } from 'react-spring/three';
import { pick } from 'canvas-sketch-util/random';
import { mapRange } from 'canvas-sketch-util/math';
import { createCanvas } from './utlis';
import { PIXEL_RATIO, SCROLL_VIEW_HEIGHT, SCROLL_VIEW_WIDTH, WIDTH, WIDTH_BY_PIXEL_RATIO, COLOR } from './constants';
import { maps as mapsData } from './maps/index.js';
import { maps, order, w0, w1, totalBahasa } from './data';
import Title from './Title';

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
    context.fillStyle = "white";
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

function Text({ left }) {
  const { viewport: { width: vw, height: vh } } = useThree();

  return (
    <a.group
      position={left.interpolate((l) => {
        const x = mapRange(l, 0, WIDTH * 0.5, vw * -0.5, -vw);

        return [x, vh * 0.5, 0];
      })}
    >
      <Dom>
        <Title />
      </Dom>
    </a.group>
  )
}

function Control({ onClick }) {
  const { viewport: { width, height } } = useThree();
  const s = 0.8;

  const canvas = useMemo(() => {
    const canvas = createCanvas(WIDTH, WIDTH);
    const context = canvas.getContext('2d');

    const w = WIDTH_BY_PIXEL_RATIO;

    context.beginPath();
    context.lineWidth = w * 0.05;
    context.strokeStyle = COLOR;
    context.arc(w * 0.5, w * 0.5, w * 0.3, 0, Math.PI * 2);
    context.stroke();

    context.beginPath();
    context.lineWidth = w * 0.2;
    context.strokeStyle = COLOR;
    context.arc(w * 0.5, w * 0.5, w * 0.1, 0, Math.PI * 2);
    context.stroke();

    return canvas;
  }, []);

  return (
    <mesh scale={[s, s, s]} position={[width * 0.46, height * -0.45, 0]} onClick={onClick}>
      <meshBasicMaterial attach="material" transparent>
        <canvasTexture attach="map" image={canvas} />
      </meshBasicMaterial>
      <planeBufferGeometry attach="geometry" args={[1, 1, 1]} />
    </mesh>
  )
}

function Gallery({ top, left, setScroll, setLocation, setTooltip, setGalleryPosition, galleryPositionY }) {
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
      y = y * -1;

      if (positionRef.current === position && activeRef.current) {
        set({
          y: 0,
        });

        setGalleryPosition([xScroll, zScroll]);
        galleryPositionY.current = y;

        setScroll(xScroll, 0);
        setTooltip(false);

        activeRef.current = false;
        setLocation(key);
      } else {
        setTooltip(true);
        setScroll(xScroll, zScroll);

        set({ y });
        activeRef.current = true;
      }

      positionRef.current = position;
    }
  }, [set, setGalleryPosition, galleryPositionY, setScroll, setTooltip, setLocation]);

  const zoomOut = useCallback(() => {
    if (activeRef.current) {
      const [p, c] = positionRef.current;

      const xScroll = mapRange(p[0] + c[0], w0, w1, 0, SCROLL_VIEW_WIDTH);
      setScroll(xScroll, 0);
    }

    set({
      y: 0
    });

    setTooltip(false);
    activeRef.current = false;
  }, [set, setScroll, setTooltip]);

  useEffect(() => {
    if (galleryPositionY.current !== null) {
      set({
        y: galleryPositionY.current
      })

      galleryPositionY.current = null;
    }
  }, [galleryPositionY, set]);

  return (
    <group>
      <Text left={left} />
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
                const [x, y, z, mapsKey, color] = c;

                return (
                  <Painting
                    key={mapsKey}
                    position={[x, y, z]}
                    onClick={onClick([d.parent, c])}
                    color={color}
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
      <Control onClick={zoomOut} />
    </group>
  )
}

export default Gallery;
