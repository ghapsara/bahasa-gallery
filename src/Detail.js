import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useSpring, interpolate, config, animated } from 'react-spring';
import { lerp, mapRange, degToRad, radToDeg, linspace } from 'canvas-sketch-util/math';
import * as random from 'canvas-sketch-util/random';
import { range, geoMercator, geoPath } from 'd3';
import { mesh } from 'topojson-client';
import bahasa from './data/provinsi-bahasa.json';
import bali from './maps/bali.json';


const bahasaData = bahasa.reduce((prev, curr) => ({
  ...prev,
  [curr.provinsi]: curr.bahasa
}), {});

console.log(bahasaData);

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const CENTER_X = WIDTH * 0.5;
const CENTER_Y = HEIGHT * 0.5;
const COLOR = '#ff8000';

const TEXT_COLOR = '#003732';

const BACKGROUND_COLOR = '#df3a46';

const FONT_SIZE = 80;


const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: scroll;
`;

const ScrollWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: ${props => props.height}px;
`;

const SvgContainer = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
`;

function mapsPath(map, name) {
  return map.objects[name].geometries.map(d => {
    const p = mesh(map, d);

    const projection = geoMercator().fitSize([WIDTH * 0.8, HEIGHT * 0.8], p);
    const path = geoPath(projection);

    return path(p);
  });
};

function TextMask({ textList, scrollHeight, y, ...props }) {
  const left = WIDTH * 0.1;

  return (
    <animated.text
      {...props}
      fontSize={FONT_SIZE}
      alignmentBaseline="middle"
      dominantBaseline="middle"
      y={y.interpolate(t => -t)}
    >
      {textList.map(d =>
        <tspan key={d} x={left} dy="1.2em">{d}</tspan>
      )}
    </animated.text>
  );
}

function Detail() {
  const [{ scrollTop }, set] = useSpring(() => ({
    scrollTop: 0,
    config: config.gentle,
  }));

  const onScroll = useCallback((e) => {
    set({ scrollTop: e.target.scrollTop });
  }, [set]);


  const items = bahasaData['Kalimantan Timur'].map(d => d.replace('Bahasa', '').trim());

  const scrollHeight = (items.length * (FONT_SIZE * 1.2)) + (FONT_SIZE * 1.2);
  // infinite scroll
  // scroll direction

  const maps = mapsPath(bali, 'bali');

  const mapsTransform = `translate(${0.1 * WIDTH}, ${0.1 * HEIGHT})`;

  return (
    <Container onScroll={onScroll}>
      <ScrollWrapper height={scrollHeight}>
        <SvgContainer>
          <svg
            width={WIDTH}
            height={HEIGHT}
          >
            <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill={BACKGROUND_COLOR} />
            <mask id="mask-text-inside-maps">
              <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="white" />
              <TextMask scrollHeight={scrollHeight} y={scrollTop} textList={items} />
            </mask>
            <mask id="mask-text-outside-maps">
              <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="white" />
              <TextMask scrollHeight={scrollHeight} y={scrollTop} textList={items} />
            </mask>
            <mask id="mask-maps">
              <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="white" />
              <path d={maps[1]} transform={mapsTransform} />
            </mask>

            <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill={BACKGROUND_COLOR} mask="url(#mask-text-outside-maps)" />

            <g mask="url(#mask-maps)">
              <TextMask scrollHeight={scrollHeight} y={scrollTop} textList={items} fill={TEXT_COLOR} />
            </g>

            <g mask="url(#mask-text-inside-maps)">
              <path d={maps[1]} fill={TEXT_COLOR} transform={mapsTransform} />
            </g>
            {/* <rect
              x={0}
              y={CENTER_Y - (FONT_SIZE * 0.5)}
              width={WIDTH}
              height={FONT_SIZE}
            /> */}
          </svg>
        </SvgContainer>
      </ScrollWrapper>
    </Container>
  )
}


export default Detail
