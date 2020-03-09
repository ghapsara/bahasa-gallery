import React, { useState, forwardRef } from 'react';
import { animated, useSpring, config, useTrail, interpolate } from 'react-spring';
import { Dom, useThree } from 'react-three-fiber';
import { lerp, clamp } from 'canvas-sketch-util/math';
import styled from 'styled-components';
import { BACKGROUND_COLOR } from './constants';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  display: grid;
  height: 100px;
  width: 100vw;
  grid-template-columns: 100px 100px;
  grid-column-gap: 8px;
  justify-items: center;
  align-items: center;
  justify-content: center;
`;

const Text = styled.div`
  color: white;
  font-size: 18px;
`;

const Container = forwardRef((props, ref) => {
  const { viewport: { width, height } } = useThree();

  return (
    <Dom
      ref={ref}
      position={[width * -0.5, height * -0.37, 0]}
      style={{ display: 'none' }}
    >
      {props.children}
    </Dom>
  )
})

export const Close = forwardRef(({ text, ...props }, ref) => {
  const [w, h] = [65, 65];

  const { r1, r2, r3, r4, r0 } = useSpring({
    from: {
      r1: 'translate(0,0)',
      r2: `translate(${w * 0.5}, 0)`,
      r3: `translate(0, ${h * 0.5})`,
      r4: `translate(${w * 0.5}, ${h * 0.5})`,
      r0: 'rotate(0turn)',
    },
    to: async next => {
      while (1) {
        await next({
          r1: `translate(${-w * 0.5}, ${-h * 0.5})`,
          r2: `translate(${w}, ${-h * 0.5})`,
          r3: `translate(${-w * 0.5}, ${h})`,
          r4: `translate(${w}, ${h})`,
        });
        await next({
          r0: 'rotate(1turn)',
        });
        await next({
          r1: 'translate(0,0)',
          r2: `translate(${w * 0.5}, 0)`,
          r3: `translate(0, ${h * 0.5})`,
          r4: `translate(${w * 0.5}, ${h * 0.5})`,
        });
        await next({
          r0: 'rotate(0turn)',
        });
        await next({
          r1: `translate(${-w * 0.5}, ${-h * 0.5})`,
          r2: `translate(${w}, ${-h * 0.5})`,
          r3: `translate(${-w * 0.5}, ${h})`,
          r4: `translate(${w}, ${h})`,
        });
        await next({
          r0: 'rotate(-1turn)',
        });
        await next({
          r1: 'translate(0,0)',
          r2: `translate(${w * 0.5}, 0)`,
          r3: `translate(0, ${h * 0.5})`,
          r4: `translate(${w * 0.5}, ${h * 0.5})`,
        });
        await next({
          r0: 'rotate(0turn)',
        });
      }
    },
    config: config.slow
  });

  return (
    <Container ref={ref}>
      <Wrapper {...props}>
        <animated.div
          style={{ transform: r0 }}
        >
          <svg width={w} height={h}>
            <line
              stroke="white"
              strokeWidth={5}
              x1={w * 0.2}
              y1={h * 0.2}
              x2={w * 0.8}
              y2={h * 0.8}
            />
            <line
              stroke="white"
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
        <Text>{text}</Text>
      </Wrapper>
    </Container>
  )
});

export const Scroll = forwardRef((props, ref) => {
  const [w, h] = [100, 100];

  const { ly2, arrow } = useSpring({
    from: {
      ly2: h * 0.3,
      arrow: `translate(0, ${h * 0.4})`
    },
    to: async next => {
      while (1) {
        await next({
          ly2: h * 0.7,
          arrow: `translate(0, ${h * 0.6})`
        });
        await next({
          ly2: h * 0.3,
          arrow: `translate(0, ${h * 0.4})`
        });
      }
    }
  });

  return (
    <Container ref={ref}>
      <Wrapper>
        <div>
          <svg width={w} height={h}>
            <animated.line
              stroke="white"
              strokeWidth={5}
              x1={w * 0.5}
              y1={h * 0.3}
              x2={w * 0.5}
              y2={ly2}
            />
            <animated.g transform={arrow}>
              <animated.path
                stroke="white"
                fill="none"
                strokeWidth={5}
                d={`M ${w * 0.35},0 L${w * 0.5},${h * 0.13} L${w * 0.65},0`}
              />
            </animated.g>
          </svg>
        </div>
        <Text>scroll to explore</Text>
      </Wrapper>
    </Container>
  );
});

export const Explore = forwardRef((props, ref) => {
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
    <Container ref={ref}>
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
                  stroke="white"
                  strokeWidth={5}
                />
              )
            })}
          </svg>
        </div>
        <Text>click map to open</Text>
      </Wrapper>
    </Container>
  )
})

export default {
  Explore,
  Scroll,
  Close,
};
