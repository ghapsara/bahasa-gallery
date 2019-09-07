import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import * as OrbitControls from 'three-orbitcontrols';
import { Canvas, useRender, useThree, useUpdate } from 'react-three-fiber';
import { useSpring, a, interpolate } from 'react-spring/three';
import { useSpring as useDefaultSpring } from 'react-spring';
import { animated } from 'react-spring';
import { geoMercator, geoPath, scaleLinear, easeBounce, range } from 'd3';
import { lerp, inverseLerp, mapRange } from 'canvas-sketch-util/math';
import * as random from 'canvas-sketch-util/random';
import { feature, mesh } from 'topojson-client';
import { getPixelRatio, createCanvas } from './utlis';
import fontJson from './font/noto-sans-regular.json';
import bali from './maps/bali.json';
import jawaBarat from './maps/jawa-barat.json';
import jawaTimur from './maps/jawa-timur.json';
import indonesiaMap from './maps/indonesia.json';
import svgMesh3d from 'svg-mesh-3d';
const createGeometry = require('three-simplicial-complex')(THREE);

const pixelRatio = getPixelRatio();
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const BACKGROUND_COLOR = '#272727';
const COLOR = '#FE9B96';
const COLOR_1 = '#fff78f';
const SCROLL_HEIGHT = 5 * HEIGHT;

const WIDTH_RATIO = WIDTH / HEIGHT;
const HEIGHT_RATIO = HEIGHT / WIDTH;

const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

const FONT = new THREE.FontLoader().parse(fontJson);

function drawTextAlongArc(context, str, centerX, centerY, radius, angle) {
	var len = str.length, s;
	context.save();
	context.translate(centerX, centerY);
	context.rotate(-1 * angle / 2);
	context.rotate(-1 * (angle / len) / 2);
	for (var n = 0; n < len; n++) {
		context.rotate(angle / len);
		context.save();
		context.translate(0, -1 * radius);
		s = str[n];
		context.fillText(s, 0, 0);
		context.restore();
	}
	context.restore();
}

function mapsPath(map, name) {
	const features = mesh(map, map.objects[name]);

	const projection = geoMercator().fitSize([WIDTH, HEIGHT], features);
	const path = geoPath(projection)

	return map.objects[name].geometries.map(d => {
		const p = mesh(map, d);
		return path(p);
	});
};

function mapsPathFeature(map, name) {
	const features = feature(map, map.objects[name]);

	const projection = geoMercator().fitSize([WIDTH, HEIGHT], features);
	const path = geoPath().projection(projection);

	return path(features);
}

function Title({ text, ...props }) {
	const [hovered, setHovered] = useState(false);

	const geometry = new THREE.TextGeometry(text, {
		font: FONT,
		size: 1,
		height: 0
	}).center();

	return (
		<group {...props} onClick={() => setHovered(!hovered)}>
			{/* <mesh scale={[9 * WIDTH_RATIO, 9, 9]}>
				<meshBasicMaterial attach="material" color="black" opacity={0} />
				<planeBufferGeometry attach="geometry" args={[1, 1, 1]} />
			</mesh> */}
			<mesh geometry={geometry}>
				<meshBasicMaterial
					attach="material"
					color={COLOR}
				/>
			</mesh>
		</group>
	);
}

function Maps({ map, cityMap, position, name, setCamera, setScroll, length }) {
	const sizeH = 1.3;
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
		context.fillStyle = COLOR;
		context.fillRect(0, 0, w, h);

		context.beginPath();
		context.fillStyle = 'white';
		context.fillRect(0, h * 0.8, w, 0.2 * h);

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
		context.fillStyle = 'white';
		context.fill();

		return canvas;
	}, [cityMap, map, name]);

	const [{ scale, x, y }, set] = useSpring(() => ({ scale: 1, x: 0.5, y: 0.5 }));

	const onMouseOver = useCallback(() => {
		set({ scale: 1.1 });
	}, [set]);

	const onMouseOut = useCallback(() => {
		set({ x: 0.5, y: 0.5, scale: 1 });
		// setCamera({ camera: [0, 0] })
	}, [set]);

	const onMouseMove = useCallback(({ uv: { x, y } }) => {
		set({ x, y });
	}, [set]);

	const onClick = useCallback(() => {
		setCamera(position)

		const z = position[2];
		const a = mapRange(z, 0, -1 * length, 0, SCROLL_HEIGHT - HEIGHT, true);

		setScroll(a);
	}, [setCamera, position, length, setScroll]);

	return (
		<a.mesh
			position={position}
			scale={scale.interpolate(s => [s, s, s])}
			rotation={interpolate([x, y], (x, y) => [lerp(-0.1, 0.1, x), lerp(-0.1, 0.1, x), 0])}
			onPointerOver={onMouseOver}
			onPointerOut={onMouseOut}
			onPointerMove={onMouseMove}
			onClick={onClick}
		>
			<meshBasicMaterial attach="material">
				<canvasTexture attach="map" image={canvas} />
			</meshBasicMaterial>
			<planeBufferGeometry attach="geometry" args={[1, sizeH, 1]} />
			{/* <meshBasicMaterial attach="material" color={COLOR} />
			<planeBufferGeometry attach="geometry" args={[1, 1, 1]} /> */}
		</a.mesh>
	)
}

function Province({ top, camera, setCamera, setScroll }) {
	const ref = useRef(null);
	// mannipulate scroll to navigate, not the position

	// state for map positions: 
	// although the position is randomed, saving it in the state will be good option for user exxperience

	const map = bali;
	const provinceName = 'bali';
	const object = map.objects[provinceName];

	const l = object.geometries.length;

	const ps = [
		[2.6972120326656737, 0.10299590988834555, 0],
		[-1.800823102407262, -2.010885045065346, -1],
		[-1.3437012021270387, 2.29540553028275, -2],
		[2.900700745105882, 0.7024040966438084, -3],
		[-0.7275335104353186, 2.4672009064480775, -4],
		[0.8977237580630592, 0.5650573535354029, -5],
		[0, 0, -6],
		[-0.041597805056849596, -0.9673860277031271, -7],
		[2.360748251692331, 0.9294259374874548, -8]
	];

	// const locs = ["Badung",
	// "Bangli",
	// "Buleleng",
	// "Denpasar",
	// "Gianyar",
	// "Jembrana",
	// "Karang Asem",
	// "Klungkung",
	// "Tabanan"];

	const topInterpolator = useCallback((top) => mapRange(top, 0, SCROLL_HEIGHT - HEIGHT, 0, l), [l]);

	return (
		<a.group
			position={interpolate([top, camera], (t, cam) => {
				const [x, y] = cam;
				const z = topInterpolator(t);
				return [-x, -y, z];
			})}
		>
			{
				object.geometries.map((d, i) => {
					const { properties: { kabkot: name } } = d;

					let position = ps[i];

					return (
						<Maps
							key={i}
							map={map}
							cityMap={d}
							position={position}
							name={name}
							setCamera={setCamera}
							setScroll={setScroll}
							length={l}
						/>
					)
				})
			}
		</a.group>
	)
}

function Gallery({ top }) {
	const locs = ['bali', 'papua barat', 'kepulauan riau'];

	const gap = 20;
	const lastZ = locs.length * gap;

	return (
		<a.group
			position={top.interpolate([0, SCROLL_HEIGHT], [0, lastZ]).interpolate(t => [0, 0, t])}
		>
			{locs.map((l, i) => {
				const z = i * gap * -1;
				return (
					<Title key={l} text={l} position={[0, 0, z]} />
				);
			})}
		</a.group>
	)
}

function CenterNavigation({ setCamera, setScroll }) {
	const onClick = useCallback(() => {
		setScroll(0);
		setCamera({ camera: [0, 0, 0] })
	}, [setCamera, setScroll])

	return (
		<div
			style={{
				position: 'fixed',
				bottom: 10,
				left: WIDTH / 2,
				display: 'flex',
				justifyContent: 'center'
			}}>
			<button
				onClick={onClick}
			>center</button>
		</div>
	)
}

function Geo() {
	const map = jawaTimur;
	const provinceName = 'jawa-timur';
	const object = map.objects[provinceName];
	const features = mesh(map, object);

	const projection = geoMercator().fitSize([WIDTH, HEIGHT], features);
	const path = geoPath(projection);

	const l = object.geometries.length;

	return (
		<svg width={WIDTH} height={HEIGHT}>
			{object.geometries.map((d, i) => {
				const p = mesh(map, d);
				const [cx, cy] = path.centroid(p);

				const n = 1;
				const x = lerp(0, WIDTH, n);
				const y = lerp(0, HEIGHT, n);

				return (<g key={i}>
					<path d={path(p)} />

					<circle cx={x} cy={y} r={5} fill="red" />
				</g>)
			})}
		</svg>
	)
}

function CanvasText({ top }) {
	const w = 1.3;
	const H = WIDTH * 1.3;
	// console.log(WIDTH);
	const fontSize = 0.15 * WIDTH;
	const canvas = useMemo(() => {
		const canvas = createCanvas(WIDTH, H);
		const context = canvas.getContext('2d');

		const width = WIDTH * pixelRatio;
		const height = H * pixelRatio;

		context.beginPath();
		context.strokeStyle = COLOR;
		context.lineWidth = 20;
		context.strokeRect(0, 0, width, height);

		context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'top';
		context.fillStyle = COLOR;
		context.fillText('Penukal Abab Lematang Ilir', width * 0.5, height * 0.5);

		return canvas;
	}, [H, fontSize]);

	return (
		<a.mesh scale={interpolate(top, [0, SCROLL_HEIGHT], [2, 7]).interpolate(t => [t, t, t])}>
			<meshBasicMaterial attach="material">
				<canvasTexture attach="map" image={canvas} />
			</meshBasicMaterial>
			<planeBufferGeometry attach="geometry" args={[1, w, 0]} />
		</a.mesh>
	)
}

function App() {
	const [{ top, mouse, camera }, set] = useSpring(() => ({ top: 0, camera: [0, 0, 3], mouse: [WIDTH / 2, 0] }));
	const [{ scrollBarTop }, setScrollBarTop] = useDefaultSpring(() => ({ scrollBarTop: 0 }));

	const onScroll = useCallback((e) => {
		set({ top: e.target.scrollTop });
	}, [set]);

	const onMouseMove = useCallback(({ clientX: x, clientY: y }) => {
		set({ mouse: [x, y] })
	}, [set]);

	const setScroll = useCallback((t) => {
		set({ top: t });
		setScrollBarTop({ scrollBarTop: t });
	}, [set, setScrollBarTop]);

	const setCamera = useCallback((position) => {
		set({ camera: position });
	}, [set]);

	return (
		<div style={{
			width: '100%',
			height: '100vh',
		}}>
			<animated.div
				scrollTop={scrollBarTop}
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
					<div className="canvas-container" onMouseMove={onMouseMove}>
						<Canvas>
							<Province
								top={top}
								mouse={mouse}
								camera={camera}
								setCamera={setCamera}
								setMouse={set}
								setScroll={setScroll}
							/>
						</Canvas>
						{/* <CenterNavigation setCamera={setCamera} setScroll={setScroll} /> */}
					</div>
				</div>
			</animated.div>
		</div>
	);
}

export default App;
