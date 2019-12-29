import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Canvas } from 'react-three-fiber';
import { useSpring, a, interpolate, config } from 'react-spring/three';
import { geoMercator, geoPath, set } from 'd3';
import { feature, mesh } from 'topojson-client';
import { lerp, mapRange } from 'canvas-sketch-util/math';
import * as random from 'canvas-sketch-util/random';
import * as THREE from 'three';
import { getPixelRatio, createCanvas } from './utlis';
import bali from './maps/bali.json';
import Bahasa from './Bahasa';

const pixelRatio = getPixelRatio();
const BACKGROUND_COLOR = '#423c4a';
const COLOR = '#FE9B96';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const SCROLL_HEIGHT = 5 * HEIGHT;
const SCROLL_VIEW_HEIGHT = SCROLL_HEIGHT - HEIGHT;

function Maps({ topology, geometry, position, name, isActive, isInDetail, onClick }) {
	const sizeH = 1.3;
	const size = 1;
	const scaled = size * 1.5;

	const canvas = useMemo(() => {
		const H = WIDTH * sizeH;

		const canvas = createCanvas(WIDTH, H);
		const context = canvas.getContext('2d');

		const w = WIDTH * pixelRatio;
		const h = H * pixelRatio;

		const m = mesh(topology, geometry);

		const sw = w * 0.8;
		const sh = h * 0.65;

		const projection = geoMercator().fitSize([sw, sh], m);
		const path = geoPath(projection, context)

		context.beginPath();
		context.lineWidth = 20;
		context.strokeStyle = COLOR;
		context.strokeRect(0, 0, w, h);

		const fontSize = 0.15 * WIDTH;

		context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'top';
		context.fillStyle = COLOR;
		context.fillText(name, w * 0.5, h * 0.86);

		context.translate(w * 0.1, h * 0.1);

		context.beginPath();
		path(m);
		context.fillStyle = COLOR;
		context.fill();

		return canvas;
	}, [topology, geometry, name, sizeH]);

	const inactivePosition = useMemo(() => {
		const [x, y, z] = position;

		const s = z * 0.5;
		const toTop = [x, s, z];
		const toRight = [s, y, z];
		const toBottom = [x, -s, z];
		const toLeft = [-s, y, z];

		return random.pick([toTop, toRight, toBottom, toLeft]);
	}, [position]);

	const [{ rX, rY }, set] = useSpring(() => ({ rX: 0.5, rY: 0.5 }));

	const { scale, p } = useSpring({
		from: {
			p: position,
			scale: 1,
		},
		to: {
			p: isInDetail ? (isActive ? position : inactivePosition) : position,
			scale: isInDetail ? (isActive ? scaled : 0) : size,
		},
		config: config.slow
	});

	const onMouseOut = useCallback(() => {
		set({ rX: 0.5, rY: 0.5 });
	}, [set]);

	const onMouseMove = useCallback(({ uv: { x, y } }) => {
		set({ rX: x, rY: y });
	}, [set]);

	return (
		<a.mesh
			position={p}
			scale={scale.interpolate(s => [s, s, s])}
			rotation={interpolate([rX, rY], (x, y) => [lerp(-0.02, 0.08, y), lerp(-0.1, 0.1, x), 0])}
			onPointerOut={onMouseOut}
			onPointerMove={onMouseMove}
			onClick={onClick(name, position)}
		>
			<a.meshBasicMaterial attach="material">
				<canvasTexture attach="map" image={canvas} />
			</a.meshBasicMaterial>
			<planeBufferGeometry attach="geometry" args={[1, sizeH, 1]} />
		</a.mesh>
	)
}

function MainMaps({ map, position, name }) {
	const canvas = useMemo(() => {
		const H = WIDTH * 0.7;
		const w = WIDTH * pixelRatio;
		const h = H * pixelRatio;

		const sw = w;
		const sh = h;

		const f = feature(map, map.objects[name]);
		const projection = geoMercator().fitSize([sw, sh], f);

		const canvas = createCanvas(WIDTH, H);
		const context = canvas.getContext('2d');

		const path = geoPath(projection, context);

		context.beginPath();
		context.strokeStyle = COLOR;
		context.lineWidth = 10;
		path(f);
		context.stroke();

		return canvas;
	}, [map, name]);

	return (
		<mesh position={position} scale={[1.5, 1.5, 1.5]}>
			<meshBasicMaterial attach="material" transparent>
				<canvasTexture attach="map" image={canvas} />
			</meshBasicMaterial>
			<planeBufferGeometry attach="geometry" args={[1, 0.7, 1]} />
		</mesh>
	)
}

function Province({ top, setScroll, isRest }) {
	const map = bali;
	const provinceName = 'bali';
	const object = map.objects[provinceName];

	const totalMaps = object.geometries.length;
	const v = 2;
	const maxZoom = ((totalMaps * v) + 3);

	const positions = useMemo(() => {
		return object.geometries.reduce((prev, d, i) => {
			const { properties: { kabkot: name } } = d;
			const [x, y] = random.insideCircle(3);
			const z = (i + 1) * -v;

			return {
				...prev,
				[name]: [x, y, z]
			};
		}, {});
	}, [object.geometries]);

	const [maps, setIsActive] = useState(null);
	const isInDetail = maps !== null;
	// const mapsPosition = positions[maps];

	const [{ xy }, setXY] = useSpring(() => ({ xy: [0, 0] }));

	const zoomIn = useCallback(position => {
		const [x, y, z] = position;
		const top = mapRange(z - 3, 0, -1 * maxZoom, 0, SCROLL_VIEW_HEIGHT);

		setScroll(top);
		setXY({ xy: [x, y] });
	}, [maxZoom, setScroll, setXY]);

	const zoomOut = useCallback(() => {
		setXY({ xy: [0, 0] });
	}, [setXY]);

	const onClick = useCallback((name, position) => {
		return () => {
			if (!isInDetail) {
				setIsActive(name);
				zoomIn(position);
			} else {
				setIsActive(null)
				zoomOut();
			}
		}
	}, [isInDetail, zoomIn, zoomOut]);


	const topInterpolator = useCallback((top) => {
		return mapRange(top, 0, SCROLL_VIEW_HEIGHT, 0, maxZoom);
	}, [maxZoom]);

	return (
		<a.group
			position={interpolate([top, xy], (t, xy) => {
				const [x, y] = xy;
				const z = topInterpolator(t);
				return [-x, -y, z];
			})}
		>
			<MainMaps
				key="bali-1"
				name={provinceName}
				map={map}
				position={[0, 0, 4]}
			/>
			{object.geometries.map((d, i) => {
				const { properties: { kabkot: name } } = d;
				const position = positions[name];
				const isActive = maps === name;

				return (
					<Maps
						key={i}
						name={name}
						topology={map}
						geometry={d}
						position={position}
						isActive={isActive}
						isInDetail={isInDetail}
						onClick={onClick}
					/>
				)
			})}
			{/* <Bahasa
				top={top}
				position={mapsPosition}
				isInDetail={isInDetail}
			/> */}
		</a.group>
	)
}

function App() {
	const [isRest, setIsRest] = useState(true);
	const [{ top }, set] = useSpring(() => ({
		to: { top: 0 },
		onStart: () => void isRest && setIsRest(false),
		onRest: () => void !isRest && setIsRest(true)
	}));

	const scrollRef = useRef(null);

	const onScroll = useCallback((e) => {
		set({ top: e.target.scrollTop });
	}, [set]);

	const setScroll = useCallback((t) => {
		scrollRef.current.scrollTo(0, t);
	}, []);

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
						width: '100vw',
						zIndex: 10,
					}}
				>
					<div className="canvas-container">
						<Canvas
							// pixelRatio={pixelRatio}
							style={{
								backgroundColor: BACKGROUND_COLOR
							}}>
							<Province
								top={top}
								setScroll={setScroll}
								isRest={isRest}
							/>
						</Canvas>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
