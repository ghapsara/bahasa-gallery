import React, { useState, useCallback, useMemo } from 'react';
import { useSpring, a, interpolate, config, useTransition } from 'react-spring/three';
import { mapRange, } from 'canvas-sketch-util/math';
import { insideCircle, pick } from 'canvas-sketch-util/random';
import maps from './maps/index';
import { SCROLL_VIEW_HEIGHT } from './constants';
import Maps from './Maps';
import { Close } from './Tooltip';

function Province({ top, setTop, name, setCity, tooltipRef, close }) {
  const map = maps[name];
  const object = map.objects[name];

  const totalMaps = object.geometries.length;
  const v = 3;
  const maxZoom = ((totalMaps * v) + 3);

  const [geometries, positions] = useMemo(() => {
    const positions = object.geometries.map((d, i) => {
      const { properties: { kabkot: name }, id: key } = d;
      let [x, y] = insideCircle(6);
      const z = (i + 1) * -v;

      const s = maxZoom * 2;
      const toTop = [x, s, z];
      const toRight = [s, y, z];
      const toBottom = [x, -s, z];
      const toLeft = [-s, y, z];

      const [x1, y1, z1] = pick([toTop, toRight, toBottom, toLeft]);

      return {
        name,
        key,
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
        .filter(p => p.name === active.name)
      : positions,
    p => p.key,
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

  const onClick = useCallback((name, position) => {
    return () => {
      const [x, y, z] = position;
      const st = mapRange(-z + 3, 0, maxZoom, 0, SCROLL_VIEW_HEIGHT);

      if (active == null) {
        setActive({ name });
        setXY({ xy: [-x, -y] });

        setTop(st, true);
        setCity(name);
      } else {
        setActive(null);
        setXY({ xy: [0, 0] });

        setTop(st, false);
        setCity(null);
      }
    }
  }, [active, maxZoom, setTop, setXY, setCity]);

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
              onClick={onClick(item.name, item.from.position)}
            />
          );
        })}
      </a.group>
      {/* <Close
        ref={tooltipRef} text="click to close" onClick={() => {
          close();
        }} /> */}
    </group>
  );
}

export default Province;