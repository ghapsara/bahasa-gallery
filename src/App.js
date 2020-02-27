import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Canvas } from 'react-three-fiber';
import { useSpring, a, interpolate, config, useChain, useSprings, useTransition } from 'react-spring/three';
import { mapRange, lerp } from 'canvas-sketch-util/math';
import { insideCircle, shuffle, pick } from 'canvas-sketch-util/random';
import bali from './maps/bali.json';
import Maps from './Maps';
import MainMaps from './MainMaps';
import Bahasa from './Bahasa';
import {
	BACKGROUND_COLOR,
	SCROLL_HEIGHT,
	SCROLL_VIEW_HEIGHT,
	PIXEL_RATIO,
	COLORS,
	DOPE,
	SCROLL_WIDTH,
	SCROLL_VIEW_WIDTH,
} from './constants';

import Gallery from './Gallery';

function Province({ top, setTop }) {
	const map = bali;
	const provinceName = 'bali';
	const object = map.objects[provinceName];

	const totalMaps = object.geometries.length;
	const v = 3;
	const maxZoom = ((totalMaps * v) + 3);

	const positions = useMemo(() => {
		return object.geometries.map((d, i) => {
			const { properties: { kabkot: name } } = d;
			const [x, y] = insideCircle(3);
			const z = (i + 1) * -v;

			const s = maxZoom * 2;
			const toTop = [x, s, z];
			const toRight = [s, y, z];
			const toBottom = [x, -s, z];
			const toLeft = [-s, y, z];

			const [x1, y1, z1] = pick([toTop, toRight, toBottom, toLeft]);

			return {
				name,
				from: {
					position: [x, y, z]
				},
				to: {
					position: [x1, y1, z1]
				},
			};
		}, {});
	}, [maxZoom, object.geometries]);

	const [active, setActive] = useState(null);

	const mapTransitions = useTransition(
		active !== null ?
			positions
				.filter(p => p.name === active.name)
			: positions,
		p => p.name,
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

	const onClick = useCallback((name, item) => {
		return () => {
			const [x, y, z] = item.from.position;
			const st = mapRange(-z + 3, 0, maxZoom, 0, SCROLL_VIEW_HEIGHT);

			if (active == null) {
				setActive({ name });
				setXY({ xy: [-x, -y] });

				setTop(st, true);
			} else {
				setActive(null);
				setXY({ xy: [0, 0] });

				setTop(st, false);
			}
		}
	}, [active, maxZoom, setTop, setXY]);

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
						<a.mesh
							key={key}
							position={props.position}
							onClick={onClick(key, item)}
						>
							<meshBasicMaterial attach="material" color={COLORS[27]} />
							<planeBufferGeometry attach="geometry" args={[1, 1, 1]} />
						</a.mesh>
					);
				})}
			</a.group>
		</group>
	);
}

function App() {
	const scrollRef = useRef(null);
	const setScroll = useCallback((l, t) => {
		scrollRef.current.scrollTo(l, t);
	}, []);

	const [active, setActive] = useState(null);

	const [{ left, top, top1 }, set] = useSpring(() => ({
		left: 0,
		top: 0,
		top1: 0,
	}));

	const setTop = useCallback((position, isActive) => {
		set({ top: position });

		setActive(isActive ? position : null);
		setScroll(0, isActive ? 0 : position);
	}, [set, setScroll]);

	const onScroll = useCallback((e) => {
		set({
			top: active || e.target.scrollTop,
			left: e.target.scrollLeft,
			top1: active !== null ? e.target.scrollTop : 0,
		});
	}, [set, active]);

	return (
		<div style={{
			width: '100%',
			height: '100vh',
		}}>
			<div
				ref={scrollRef}
				onScroll={onScroll}
				style={{
					overflow: 'auto',
					height: '100%',
					width: '100%'
				}}
			>
				<div
					style={{
						height: SCROLL_HEIGHT,
						width: SCROLL_WIDTH,
						zIndex: 10,
					}}
				>
					<div className="canvas-container">
						<Canvas
							// pixelRatio={PIXEL_RATIO}
							style={{
								// ["#ee1d0e", "#f95850", "#f43e32", "#f87c72", "#d34b3a"]
								backgroundColor: BACKGROUND_COLOR
							}}
						>
							{active !== null && <Bahasa
								top={top1}
							/>}
							<Province
								top={top}
								setTop={setTop}
								setScroll={setScroll}
							/>
							{/* <Gallery
								top={top}
								left={left}
								setScroll={setScroll}
							/> */}
						</Canvas>
					</div>
				</div>
			</div>
		</div >
	);
}

export default App;
