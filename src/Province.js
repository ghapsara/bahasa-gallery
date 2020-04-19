import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useThree } from 'react-three-fiber';
import { useSpring, a, interpolate, config, useTransition } from 'react-spring/three';
import { mapRange, } from 'canvas-sketch-util/math';
import { insideCircle, pick } from 'canvas-sketch-util/random';
import maps from './maps/index';
import { SCROLL_VIEW_HEIGHT, WIDTH_BY_PIXEL_RATIO, HEIGHT, HEIGHT_BY_PIXEL_RATIO, PIXEL_RATIO, COLOR } from './constants';
import Maps from './Maps';
import { mapsColor, bahasaAll } from './data';
import { createCanvas } from './utlis';

function lookUpBahasa(province, city) {
  const p = province.split("-").map(d => d[0].toUpperCase() + d.slice(1)).join(' ');
  const location = `${p}-${city}`;

  return bahasaAll[location] != null ? bahasaAll[location].length : 0;
}

function Text() {
  const { size, viewport } = useThree();
  const { width, height } = size;

  const canvas = useMemo(() => {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const w = width * PIXEL_RATIO;
    const h = height * PIXEL_RATIO;

    const fontSize = 400;
    const font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
    context.font = font;
    context.textAlign = 'left';
    context.textBaseline = "bottom";
    context.fillStyle = "black";
    context.fillText("5", 0, h);

    return canvas;
  }, [width, height]);

  const s = viewport.height;
  const ww = (width / height) * s;

  return (
    <mesh scale={[1, 1, 1]}>
      <meshBasicMaterial attach="material" transparent opacity={0.5}>
        <canvasTexture attach="map" image={canvas} />
      </meshBasicMaterial>
      {/* <meshBasicMaterial attach="material" color="tomato" /> */}
      <planeBufferGeometry attach="geometry" args={[ww, s, 1]} />
    </mesh>
  )
}

function Province({ top, setTop, name, setCity, setProvinceTooltip, setBahasaTooltip }) {
  const map = maps[name];
  const object = map.objects[name];

  const color = mapsColor[name];

  const totalMaps = object.geometries.length;
  const v = 3;
  const maxZoom = ((totalMaps * v) + 3);

  const [geometries, positions] = useMemo(() => {
    const positions = object.geometries.map((d, i) => {
      const { properties: { kabkot }, id } = d;
      let [x, y] = insideCircle(6);
      const z = (i + 1) * -v;

      const s = maxZoom * 2;
      const toTop = [x, s, z];
      const toRight = [s, y, z];
      const toBottom = [x, -s, z];
      const toLeft = [-s, y, z];

      const [x1, y1, z1] = pick([toTop, toRight, toBottom, toLeft]);

      const total = lookUpBahasa(name, kabkot);

      return {
        id,
        name: kabkot,
        total,
        from: {
          position: [x, y, z]
        },
        to: {
          position: [x1, y1, z1]
        },
      };
    });

    const geometries = object.geometries.reduce((prev, curr) => {
      const { properties: { kabkot: name } } = curr;

      return {
        ...prev,
        [name]: curr,
      }
    }, {});

    return [geometries, positions];
  }, [maxZoom, object]);

  const [active, setActive] = useState(null);

  const mapTransitions = useTransition(
    active !== null ?
      positions
        .filter(p => p.id === active)
      : positions,
    p => p.id,
    {
      unique: true,
      from: ({ from }) => ({ ...from, position: [0, 0, from.position[2]] }),
      enter: ({ from }) => ({ ...from }),
      leave: ({ to }) => ({ ...to }),
      update: ({ from }) => ({ ...from }),
      config: config.molasses,
    }
  );

  const [{ xy }, setXY] = useSpring(() => ({
    xy: [0, 0],
    config: config.stiff,
  }))

  const onClick = useCallback((item) => {
    return () => {
      const { id, name, from: { position } } = item;
      const [x, y, z] = position;
      const st = mapRange(-z + 3, 0, maxZoom, 0, SCROLL_VIEW_HEIGHT);

      if (active == null) {
        setActive(id);
        setXY({ xy: [-x, -y] });

        setTop(st, true);
        setCity(name);

        setBahasaTooltip(true);
        setProvinceTooltip(false);
      } else {
        setActive(null);
        setXY({ xy: [0, 0] });

        setTop(st, false);
        setCity(null);

        setBahasaTooltip(false);
        setProvinceTooltip(true);
      }
    }
  }, [active, maxZoom, setTop, setXY, setCity, setProvinceTooltip, setBahasaTooltip]);

  useEffect(() => {
    setProvinceTooltip(true);
  }, []);

  return (
    <group>
      <a.group
        position={interpolate([top, xy], (t, xy) => {
          const z = mapRange(t, 0, SCROLL_VIEW_HEIGHT, 0, maxZoom)
          return [...xy, z];
        })}
      >
        {mapTransitions.map(({ props, key, item }) => {
          return (
            <Maps
              key={key}
              name={item.name}
              topology={map}
              geometry={geometries[item.name]}
              position={props.position}
              onClick={onClick(item)}
              color={color}
              total={item.total}
            />
          );
        })}
      </a.group>
    </group>
  );
}

export default Province;