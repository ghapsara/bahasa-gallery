import React, { useState, useMemo } from 'react';
import { animated, useSpring, config, useTrail, interpolate } from 'react-spring';
import { Dom, useThree } from 'react-three-fiber';
import { lerp, clamp } from 'canvas-sketch-util/math';
import styled from 'styled-components';
import { BACKGROUND_COLOR, COLOR } from './constants';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: none;
`;

const Center = styled.div`
  display: flex;
  height: 100vh;
  align-items: flex-end;
  justify-content: center;
`;

const CloseIconWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const Wrapper = styled.div`
  display: grid;
  height: 100px;
  grid-template-columns: 100px 100px;
  align-items: center;
`;

const Text = styled.div`
  color: ${COLOR};
  font-size: 18px;
  cursor: pointer;
`;

function Close() {
  const [w, h] = [65, 65];

  const { openRect, closeRect } = useMemo(() => {
    const closeRect = {
      r1: 'translate(0,0)',
      r2: `translate(${w * 0.5}, 0)`,
      r3: `translate(0, ${h * 0.5})`,
      r4: `translate(${w * 0.5}, ${h * 0.5})`,
    }
    const openRect = {
      r1: `translate(${-w * 0.5}, ${-h * 0.5})`,
      r2: `translate(${w}, ${-h * 0.5})`,
      r3: `translate(${-w * 0.5}, ${h})`,
      r4: `translate(${w}, ${h})`,
    }

    return {
      openRect,
      closeRect
    }
  }, [h, w]);

  const [state, setState] = useState(0);

  let animation = {};
  switch (state) {
    case 0:
      animation = {
        r0: 'rotate(0turn)',
        ...openRect,
      }
      break;
    case 1:
      animation = {
        r0: 'rotate(1turn)',
        ...openRect,
      }
      break;
    case 2:
      animation = {
        r0: 'rotate(1turn)',
        ...closeRect,
      }
      break;
    case 3:
      animation = {
        r0: 'rotate(1turn)',
        ...openRect,
      }
      break;
    case 4:
      animation = {
        r0: 'rotate(0turn)',
        ...openRect,
      }
      break;
    case 5:
      animation = {
        r0: 'rotate(0turn)',
        ...closeRect,
      }
      break;
    default:
      break;
  }

  const { r1, r2, r3, r4, r0 } = useSpring({
    to: animation,
    config: config.slow,
    onRest: () => {
      setState((state + 1) % 6);
    }
  });

  return (
    <Wrapper>
      <CloseIconWrapper>
        <animated.div
          style={{ transform: r0 }}
        >
          <svg width={w} height={h}>
            <line
              stroke={COLOR}
              strokeWidth={5}
              x1={w * 0.2}
              y1={h * 0.2}
              x2={w * 0.8}
              y2={h * 0.8}
            />
            <line
              stroke={COLOR}
              strokeWidth={5}
              x1={w * 0.8}
              y1={h * 0.2}
              x2={w * 0.2}
              y2={h * 0.8}
            />
            <animated.rect
              transform={r1}
              x={0}
              y={0}
              width={w * 0.5}
              height={h * 0.5}
              fill={BACKGROUND_COLOR}
            />
            <animated.rect
              transform={r2}
              x={0}
              y={0}
              width={w * 0.5}
              height={h * 0.5}
              fill={BACKGROUND_COLOR}
            />
            <animated.rect
              transform={r3}
              x={0}
              y={0}
              width={w * 0.5}
              height={h * 0.5}
              fill={BACKGROUND_COLOR}
            />
            <animated.rect
              transform={r4}
              x={0}
              y={0}
              width={w * 0.5}
              height={h * 0.5}
              fill={BACKGROUND_COLOR}
            />
          </svg>
        </animated.div>
      </CloseIconWrapper>
      <Text>click map to close</Text>
    </Wrapper>
  )
};

function Scroll() {
  const [w, h] = [100, 100];

  const [reversed, setReversed] = useState(false);

  const { ly2, arrow } = useSpring({
    from: {
      ly2: h * 0.3,
      arrow: `translate(0, ${h * 0.4})`
    },
    to: {
      ly2: h * 0.7,
      arrow: `translate(0, ${h * 0.6})`
    },
    reverse: reversed,
    onRest: () => {
      setReversed(!reversed);
    },
  });

  return (
    <Wrapper>
      <div>
        <svg width={w} height={h}>
          <animated.line
            stroke={COLOR}
            strokeWidth={5}
            x1={w * 0.5}
            y1={h * 0.3}
            x2={w * 0.5}
            y2={ly2}
          />
          <animated.g transform={arrow}>
            <animated.path
              stroke={COLOR}
              fill="none"
              strokeWidth={5}
              d={`M ${w * 0.35},0 L${w * 0.5},${h * 0.13} L${w * 0.65},0`}
            />
          </animated.g>
        </svg>
      </div>
      <Text>scroll to explore</Text>
    </Wrapper>
  );
};

function Explore() {
  const [w, h] = [100, 100];
  const cx = w * 0.5;
  const cy = h * 0.5;

  const [reverse, setReverse] = useState(false);

  const circles = [5, 20, 35];

  const trail = useTrail(circles.length, {
    from: { r: 0 },
    to: { r: 1 },
    config: reverse ? config.slow : config.wobbly,
    reverse,
    onRest: () => {
      if (!reverse) {
        setTimeout(() => {
          setReverse(true);
        }, 1500);
      } else {
        setReverse(false);
      }
    }
  });

  return (
    <Wrapper>
      <div>
        <svg width={w} height={h}>
          {trail.map(({ r, o }, index) => {
            return (
              <animated.circle
                key={index}
                cx={cx}
                cy={cy}
                opacity={o}
                r={interpolate([r], (r) => {
                  const r1 = lerp(0, circles[index], r);
                  return clamp(r1, 0, 45);
                })}
                fill="none"
                stroke={COLOR}
                strokeWidth={5}
              />
            )
          })}
        </svg>
      </div>
      <Text>click map to open</Text>
    </Wrapper>
  )
};

function Back({ onClick }) {
  const [w, h] = [100, 100];

  const [state, setState] = useState(0);

  const topLine = {
    x1: 0.3 * w,
    x2: 0.1 * w,
    y2: 0.5 * h,
  };

  const bottomLine = {
    x1: 0.1 * w,
    y1: 0.5 * h,
    x2: 0.3 * w,
  };

  const spring = [
    {
      g: `translate(${w}, 0)`,
      y1: 0.3 * h,
      y2: 0.7 * h,
    },
    {
      g: `translate(${w * 0.3}, 0)`,
      y1: 0.3 * h,
      y2: 0.7 * h,
    },
    {
      y1: 0.45 * h,
      y2: 0.55 * h,
    },
    {
      y1: 0.3 * h,
      y2: 0.7 * h,
    },
    {
      g: `translate(${w * -0.33}, 0)`,
      y1: 0.3 * h,
      y2: 0.7 * h,
    },
  ];

  const configs = [
    config.stiff,
    config.molasses,
    config.wobbly,
    config.wobbly,
    config.stiff,
  ];

  const {
    y1,
    y2,
    g
  } = useSpring({
    to: spring[state],
    reset: state === 0,
    immediate: state === 0,
    config: configs[state],
    onRest: () => {
      setState((state + 1) % spring.length);
    }
  });

  return (
    <Wrapper>
      <div onClick={onClick} style={{ cursor: 'pointer' }}>
        <svg width={w} height={h}>
          <animated.g transform={g}>
            <animated.line
              stroke={COLOR}
              strokeWidth={5}
              strokeLinecap="round"
              {...topLine}
              y1={y1}
            />
            <animated.line
              stroke={COLOR}
              strokeWidth={5}
              strokeLinecap="round"
              {...bottomLine}
              y2={y2}
            />
          </animated.g>
        </svg>
      </div>
      <Text onClick={onClick}>back to gallery</Text>
    </Wrapper>
  );
}

function Tooltip({ galleryTooltipRef, bahasaScrollTooltipRef, bahasaCloseTooltipRef, provinceTooltipRef, displayGallery }) {
  const { viewport: { width, height } } = useThree();

  return (
    <Dom
      position={[width * -0.5, height * 0.5, 0]}
      // position={[width * -0.5, 0, 0]}
      style={{ color: 'white' }}
    >
      <Container ref={galleryTooltipRef}>
        <Center>
          <Explore />
        </Center>
      </Container>
      <Container ref={bahasaScrollTooltipRef}>
        <Center>
          <Scroll />
        </Center>
      </Container>
      <Container ref={bahasaCloseTooltipRef}>
        <Center>
          <Close />
        </Center>
      </Container>
      <Container ref={provinceTooltipRef}>
        <Back onClick={displayGallery} />
      </Container>
    </Dom>
  )
}

export default Tooltip;
