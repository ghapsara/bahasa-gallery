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
import Search from './Search';
import Buttons from './Buttons';
import { set, tree } from 'd3';

function Province({ top, setScroll, setIsInDetail }) {
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

	// jump to the detail 
	// zoom in
	// show bahasa

	const [active, setActive] = useState(null);

	const mapRef = useRef();
	const mapTransitions = useTransition(
		active !== null ?
			positions
				.filter(p => p.name === active.name)
			: positions,
		p => p.name,
		{
			ref: mapRef,
			unique: true,
			from: ({ from }) => ({ ...from, position: [0, 0, from.position[2]] }),
			enter: ({ from }) => ({ ...from }),
			leave: ({ to }) => ({ ...to }),
			update: ({ from }) => ({ ...from }),
			config: config.slow,
		}
	);

	// const bahasaRef = useRef();

	const [{ xy }, setXY] = useSpring(() => ({
		xy: [0, 0],
		config: config.molasses,
	}))

	const [zScroll, setZScroll] = useState(0);

	const zRef = useRef();
	const { z } = useSpring({
		ref: zRef,
		from: { z: active !== null ? zScroll : top, },
		to: { z: active !== null ? zScroll : top, },
	});

	const onClick = useCallback((name, item) => {
		return () => {
			const [x, y, z] = item.from.position;

			const st = mapRange(-z + 3, 0, maxZoom, 0, SCROLL_VIEW_HEIGHT);
			setZScroll(st);

			if (active == null) {
				setActive({
					name,
				});
				setXY({ xy: [-x, -y] });
				setScroll(0, 0);
				// setIsInDetail(true);
			} else {
				setActive(null);
				setXY({ xy: [0, 0] });
				setScroll(0, st);
				// setIsInDetail(false);
			}
		}
	}, [active, maxZoom, setIsInDetail, setScroll, setXY]);

	useChain([mapRef, zRef]);

	return (
		<group>
			<a.group
				position={interpolate([z, xy], (z, xy) => {
					return [...xy, mapRange(z, 0, SCROLL_VIEW_HEIGHT, 0, maxZoom)];
				})}
			>
				{mapTransitions.map(({ props, key, item }) => {
					console.log('rendred');
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
	const [[left, top], set] = useState([0, 0]);

	const springRef = useRef();
	const [{ leftSpring, topSpring }, setScrollSpring] = useSpring(() => ({
		to: {
			leftSpring: 0, topSpring: 0,
		}
	}));

	const tRef = useRef();
	const { t } = useSpring({
		ref: tRef,
		from: { t: top },
		to: { t: top },
	});

	const scrollRef = useRef(null);

	const setScroll = useCallback((l, t) => {
		scrollRef.current.scrollTo(l, t);
	}, []);

	const [is, setIs] = useState(false);

	const onScroll = useCallback((e) => {
		const left = e.target.scrollLeft;
		const top = e.target.scrollTop;

		set([left, top]);
	}, []);

	const onScrollSpring = useCallback((e) => {
		const left = e.target.scrollLeft;
		const top = e.target.scrollTop;

		setScrollSpring({
			leftSpring: left,
			topSpring: top,
		});
	}, []);

	useChain([tRef]);

	// return (
	// 	<div>
	// 		<div
	// 			style={{
	// 				display: 'grid',
	// 				gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
	// 				height: "100vh",
	// 			}}
	// 		>
	// 			{COLORS.map((d, i) =>
	// 				<div key={i} style={{
	// 					backgroundColor: d,
	// 					display: 'flex',
	// 					justifyContent: 'center',
	// 					alignItems: 'center',
	// 					color: 'white',
	// 				}}>
	// 					{i + 1}-{d}
	// 				</div>
	// 			)}
	// 		</div>
	// 		{/* <Search /> */}
	// 	</div>
	// )

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
							{/* <Bahasa
								top={t}
							/> */}
							<Province
								top={top}
								setScroll={setScroll}
							// setIsInDetail={() => { console.log('h') }}
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

	// return (
	// 	<div>
	// 		<Buttons />
	// 	</div>
	// )
}

export default App;
