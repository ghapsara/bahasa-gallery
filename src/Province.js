import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSpring, a, interpolate, config, useTransition } from 'react-spring/three';
import { mapRange, } from 'canvas-sketch-util/math';
import { insideCircle, pick } from 'canvas-sketch-util/random';
import maps from './maps/index';
import { SCROLL_VIEW_HEIGHT } from './constants';
import Maps from './Maps';

function Province({ top, setTop, name, setCity, setProvinceTooltip, setBahasaTooltip }) {
  const map = maps[name];
  const object = map.objects[name];

  const totalMaps = object.geometries.length;
  const v = 3;
  const maxZoom = ((totalMaps * v) + 3);

  const [geometries, positions] = useMemo(() => {
    const positions = object.geometries.map((d, i) => {
      const { properties: { kabkot: name }, id } = d;
      let [x, y] = insideCircle(6);
      const z = (i + 1) * -v;

      const s = maxZoom * 2;
      const toTop = [x, s, z];
      const toRight = [s, y, z];
      const toBottom = [x, -s, z];
      const toLeft = [-s, y, z];

      const [x1, y1, z1] = pick([toTop, toRight, toBottom, toLeft]);

      return {
        id,
        name,
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
            />
          );
        })}
      </a.group>
    </group>
  );
}

export default Province;