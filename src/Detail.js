import React, { useState, useCallback, useRef, useMemo } from 'react';
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

const Container = styled.div`
  position: fixed;
  top: 0;
  height: 100vh;
  width: 100vw;
  overflow: scroll;
`;

const ScrollWrapper = styled.div`
  width: 100%;
  height: ${props => props.height}px;
`;

const SvgContainer = styled.div`
  position: sticky;
  top: 0;
  margin: ;
  height: 100vh;
  width: 100vw;
`;

const Svg = styled.svg`
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  view-box: 0 0 ${WIDTH} ${HEIGHT};
`;

function mapsPath(map, name) {
  // const features = mesh(map, map.objects[name]);


  return map.objects[name].geometries.map(d => {
    const p = mesh(map, d);

    const projection = geoMercator().fitSize([WIDTH * 0.8, HEIGHT * 0.8], p);
    const path = geoPath(projection);

    return path(p);
  });
};

function TextMask({ textList, scrollHeight, y, ...props }) {
  const fontSize = 160;
  const scrollBottom = textList.length * fontSize;

  return (
    <>
      {textList.map((text, i) => {
        return (
          <animated.text
            {...props}
            key={i}
            transform={y
              .interpolate(t => {
                const tY = ((i + 1) * fontSize) - t;
                return `translate(${CENTER_X}, ${tY})`;
              })
            }
            textAnchor="middle"
            fontSize={fontSize}
          >
            {text}
          </animated.text>
        )
      })}
    </>
  )
}

function Detail() {
  const [{ scrollTop }, set] = useSpring(() => ({
    scrollTop: 0,
    config: config.gentle,
  }));

  const onScroll = useCallback((e) => {
    set({ scrollTop: e.target.scrollTop });
  }, [set]);


  const items = bahasaData['Nusa Tenggara Timur'].map(d => d.replace('Bahasa', '').trim())

  const itemsSpace = linspace(items.length);

  const distance = 200;

  const fontSize = 160;
  const scrollBottom = (items.length + 1) * fontSize;

  const scrollHeight = scrollBottom;

  // infinite scroll
  // scroll direction

  const maps = mapsPath(bali, 'bali');

  const textTransform = `translate(${WIDTH * 0.5}, ${HEIGHT * 0.5})`;
  const mapsTransform = `translate(${0.1 * WIDTH}, ${0.1 * HEIGHT})`;

  return (
    <Container onScroll={onScroll}>
      <ScrollWrapper height={scrollHeight}>
        <SvgContainer>
          <Svg>
            <mask id="mask-text-inside-maps">
              <rect x={0} y={0} width="100%" height="100%" fill="white" />
              <TextMask scrollHeight={scrollHeight} y={scrollTop} textList={items} />
            </mask>
            <mask id="mask-text-outside-maps">
              <rect x={0} y={0} width="100%" height="100%" fill="white" />
              <TextMask scrollHeight={scrollHeight} y={scrollTop} textList={items} />
            </mask>
            <mask id="mask-maps">
              <rect x={0} y={0} width="100%" height="100%" fill="white" />
              <path d={maps[1]} transform={mapsTransform} />
            </mask>

            <rect x="0" y="0" width="100%" height="100%" fill={BACKGROUND_COLOR} />
            <rect x="0" y="0" width="100%" height="100%" fill={BACKGROUND_COLOR} mask="url(#mask-text-outside-maps)" />

            <g mask="url(#mask-maps)">
              <TextMask scrollHeight={scrollHeight} y={scrollTop} textList={items} fill={TEXT_COLOR} />
            </g>

            <g mask="url(#mask-text-inside-maps)">
              <path d={maps[1]} fill={TEXT_COLOR} transform={mapsTransform} />
            </g>
          </Svg>
        </SvgContainer>
      </ScrollWrapper>
    </Container>
  )
}


export default Detail
