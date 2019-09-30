import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
import { useSpring, a, interpolate, config } from 'react-spring/three';
import { geoMercator, geoPath } from 'd3';
import { feature, mesh } from 'topojson-client';
import { lerp, mapRange } from 'canvas-sketch-util/math';
import * as random from 'canvas-sketch-util/random';
import * as THREE from 'three';
import { getPixelRatio, createCanvas } from './utlis';
import bali from './maps/bali.json';
import DetailCanvas from './DetailCanvas';

const pixelRatio = getPixelRatio();
const BACKGROUND_COLOR = '#423c4a';
const COLOR = '#FE9B96';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const SCROLL_HEIGHT = 5 * HEIGHT;
const SCROLL_VIEW_HEIGHT = SCROLL_HEIGHT - HEIGHT;

function Maps({ map, cityMap, position, name, zoomIn, isActive, setIsActive, isInDetail, zoomOut }) {
	// const isPortrait = useMemo(() => random.pick([true, false]), []);
	const isPortrait = true;
	// tweak latter
	const sizeH = isPortrait ? 1.3 : 0.6;
	const initialScale = isPortrait ? 1 : 1.5;

	const canvas = useMemo(() => {
		const H = WIDTH * sizeH;

		const canvas = createCanvas(WIDTH, H);
		const context = canvas.getContext('2d');

		const w = WIDTH * pixelRatio;
		const h = H * pixelRatio;

		const m = mesh(map, cityMap);

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
	}, [cityMap, map, name, sizeH]);

	const positionTo = useMemo(() => {
		const [x, y, z] = position;

		const s = 20;
		const toTop = [x, s, z];
		const toRight = [s, y, z];
		const toBottom = [x, -s, z];
		const toLeft = [-s, y, z];

		return random.pick([toTop, toRight, toBottom, toLeft]);
	}, [position]);

	const [{ scale, rX, rY }, set] = useSpring(() => ({ scale: initialScale, rX: 0.5, rY: 0.5 }));

	const { o, p } = useSpring({
		from: {
			o: 1,
			p: position,
		},
		to: {
			o: isInDetail ? (isActive ? 1 : 0) : 1,
			p: isInDetail ? (isActive ? position : positionTo) : position,
		},
		config: config.slow
	})

	const onMouseOver = useCallback(() => {
		set({ scale: isActive ? initialScale * 1.5 : initialScale });
	}, [initialScale, isActive, set]);

	const onMouseOut = useCallback(() => {
		set({ rX: 0.5, rY: 0.5, scale: isActive ? initialScale * 1.5 : initialScale });
	}, [initialScale, isActive, set]);

	const onMouseMove = useCallback(({ uv: { x, y } }) => {
		set({ rX: x, rY: y });
	}, [set]);

	const onClick = useCallback(() => {
		if (!isInDetail) {
			set({ scale: initialScale * 1.5 });
			setIsActive({ [name]: true })
			zoomIn(position);
		} else {
			set({ scale: initialScale });
			setIsActive({ [name]: false })
			zoomOut();
		}
	}, [initialScale, isInDetail, name, position, set, setIsActive, zoomIn, zoomOut]);

	return (
		<a.mesh
			position={p}
			scale={scale.interpolate(s => [s, s, s])}
			rotation={interpolate([rX, rY], (x, y) => [lerp(-0.02, 0.08, y), lerp(-0.1, 0.1, x), 0])}
			onPointerOver={onMouseOver}
			onPointerOut={onMouseOut}
			onPointerMove={onMouseMove}
			onClick={onClick}
		>
			<a.meshBasicMaterial attach="material" opacity={o}>
				<canvasTexture attach="map" image={canvas} />
			</a.meshBasicMaterial>
			<planeBufferGeometry attach="geometry" args={[1, sizeH, 1]} />
		</a.mesh>
	)
}

function MainMaps({ map, position, name, zoomIn, isActive, setIsActive, isInDetail, zoomOut }) {
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

		// context.beginPath();
		// context.lineWidth = 20;
		// context.strokeStyle = COLOR;
		// context.strokeRect(0, 0, w, h);

		// const fontSize = 0.15 * WIDTH;
		// context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
		// context.textAlign = 'center';
		// context.textBaseline = 'top';
		// context.fillStyle = COLOR;
		// context.fillText('name', w * 0.5, h * 0.84);

		const path = geoPath(projection, context);

		// context.translate(w * 0.1, h * 0.1);
		// // context.beginPath();
		// // context.fillStyle = COLOR;
		// // path(f);
		// // context.fill();

		context.beginPath();
		context.strokeStyle = COLOR;
		context.lineWidth = 10;
		path(f);
		context.stroke();

		return canvas;
	}, [map, name]);

	const material = new THREE.MeshBasicMaterial({
		map: new THREE.CanvasTexture(canvas),
		transparent: true
	})

	return (
		<mesh position={position} scale={[1.5, 1.5, 1.5]} material={material}>
			{/* <meshBasicMaterial attach="material">
				<canvasTexture attach="map" image={canvas} />
			</meshBasicMaterial> */}
			<planeBufferGeometry attach="geometry" args={[1, 0.7, 1]} />
		</mesh>
	)
}

function Province({ top, xy, setXY, setScroll }) {
	const map = bali;
	const provinceName = 'bali';
	const object = map.objects[provinceName];

	const totalMaps = object.geometries.length;
	const v = 2;
	const maxZoom = ((totalMaps * v) + 3);

	const positions = useMemo(() => {
		return object.geometries.map((d, i) => {
			const [x, y] = random.insideCircle(3);
			const z = (i + 1) * -v;

			return [x, y, z];
		});
	}, [object.geometries]);

	const initialState = useMemo(() => {
		return object.geometries.map(d => {
			const { properties: { kabkot: name } } = d;

			return {
				name,
				isActive: false
			}
		}).reduce((prev, curr) => {
			return {
				...prev,
				[curr.name]: curr.isActive,
			}
		}, {})
	}, [object.geometries]);

	const [isActive, setIsActive] = useState(initialState);
	const isInDetail = Object.keys(isActive).some(k => isActive[k]);

	const zoomIn = useCallback(position => {
		const [x, y, z] = position;
		const top = mapRange(z - 3, 0, -1 * maxZoom, 0, SCROLL_VIEW_HEIGHT);

		setScroll(top);
		setXY([x, y]);
	}, [maxZoom, setScroll, setXY]);

	const zoomOut = useCallback(() => {
		setXY([0, 0]);
	}, [setXY]);

	const topInterpolator = useCallback((top) => mapRange(top, 0, SCROLL_VIEW_HEIGHT, 0, maxZoom), [maxZoom]);

	return (
		<a.group
			position={interpolate([top, xy], (t, xy) => {
				const [x, y] = xy;
				const z = topInterpolator(t);
				return [-x, -y, z];
			})}
		>
			{/* the main map */}
			<MainMaps
				key="bali-1"
				name="bali"
				map={map}
				cityMap={map}
				position={[0, 0, 4]}
				zoomIn={zoomIn}
				zoomOut={zoomOut}
				isActive={isActive["bali"]}
				setIsActive={setIsActive}
				isInDetail={isInDetail}
			/>
			{object.geometries.map((d, i) => {
				const { properties: { kabkot: name } } = d;
				const position = positions[i];

				return (
					<Maps
						key={i}
						name={name}
						map={map}
						cityMap={d}
						position={position}
						zoomIn={zoomIn}
						zoomOut={zoomOut}
						isActive={isActive[name]}
						setIsActive={setIsActive}
						isInDetail={isInDetail}
					/>
				)
			})
			}
		</a.group>
	)
}

function App() {
	const [{ top, xy }, set] = useSpring(() => ({ top: 0, xy: [0, 0, 0] }));

	const scrollRef = useRef(null);

	const onScroll = useCallback((e) => {
		set({ top: e.target.scrollTop });
	}, [set]);

	const setScroll = useCallback((t) => {
		scrollRef.current.scrollTo(0, t);
	}, []);

	const setXY = useCallback((xy) => {
		set({ xy });
	}, [set]);

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
							{/* <Province
								top={top}
								xy={xy}
								setXY={setXY}
								setScroll={setScroll}
							/> */}
							<DetailCanvas top={top} />
						</Canvas>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
