import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useRender, useThree, useUpdate } from 'react-three-fiber';
import { useSpring, a, interpolate, config } from 'react-spring/three';
import { geoMercator, geoPath, range } from 'd3';
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
const SCROLL_VIEW_HEIGHT = SCROLL_HEIGHT - HEIGHT;

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

function Maps({ map, cityMap, position, name, zoomIn, isActive, setIsActive, isInDetail, zoomOut }) {
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
		// context.fillText(name, w * 0.5, h * 0.86);

		context.translate(w * 0.1, h * 0.1);

		// context.beginPath();
		// path(m);
		// context.fillStyle = 'white';
		// context.fill();

		return canvas;
	}, [cityMap, map]);

	const [{ scale, rX, rY }, set] = useSpring(() => ({ scale: 1, rX: 0.5, rY: 0.5 }));
	const [x, y, z] = position;

	// random.setSeed(-z);
	const positionTo = useMemo(() => {
		const toTop = [x, 10, z];
		const toRight = [10, y, z];
		const toBottom = [x, -10, z];
		const toLeft = [-10, y, z];

		return random.pick([toTop, toRight, toBottom, toLeft]);
	}, [x, y, z]);

	const { pX, pY, o, p } = useSpring({
		from: {
			pX: x,
			pY: y,
			o: 1,
			p: position,
		},
		to: {
			pX: isInDetail ? (isActive ? x : Math.sign(x) * 10) : x,
			pY: isInDetail ? (isActive ? y : Math.sign(y) * 10) : y,
			o: isInDetail ? (isActive ? 1 : 0) : 1,
			p: isInDetail ? (isActive ? position : positionTo) : position,
		},
		config: config.slow
	})

	const onMouseOver = useCallback(() => {
		set({ scale: isActive ? 1.3 : 1.1 });
	}, [isActive, set]);

	const onMouseOut = useCallback(() => {
		set({ rX: 0.5, rY: 0.5, scale: isActive ? 1.3 : 1 });
	}, [isActive, set]);

	const onMouseMove = useCallback(({ uv: { x, y } }) => {
		set({ rX: x, rY: y });
	}, [set]);

	const onClick = useCallback(() => {
		if (!isInDetail) {
			set({ scale: 1.3 });
			setIsActive({ [name]: true })
			zoomIn(position);
		} else {
			set({ scale: 1 });
			setIsActive({ [name]: false })
			zoomOut();
		}
	}, [isInDetail, name, position, set, setIsActive, zoomIn, zoomOut]);

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

function Province({ top, xy, setXY, setScroll }) {
	// mannipulate scroll to navigate, not the position

	// state for map positions: 
	// although the position is randomed, saving it in the state will be good option for user exxperience

	const map = bali;
	const provinceName = 'bali';
	const object = map.objects[provinceName];

	const totalMaps = object.geometries.length;
	const v = 2;
	const maxZoom = ((totalMaps * v) + 3);

	const positions = useMemo(() => {
		return object.geometries.map((d, i) => {
			const [x, y] = random.insideCircle(3);
			const z = i * -v;

			return [x, y, z];
		});
	}, [object.geometries]);

	const initialState = object.geometries.map(d => {
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
	}, {});

	const [isActive, setIsActive] = useState(initialState);
	const isInDetail = Object.keys(isActive).some(k => isActive[k]);

	const zoomIn = useCallback(position => {
		const [x, y, z] = position;
		const top = mapRange(z - 3, 0, -1 * maxZoom, 0, SCROLL_VIEW_HEIGHT);

		setScroll(top);
		setXY([x, y]);
	}, [maxZoom, setScroll, setXY]);

	const zoomOut = useCallback(() => {
		// setScroll(0);
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

function CenterNavigation({ setXY, setScroll }) {
	const onClick = useCallback(() => {
		// setScroll(0);
		setXY([0, 0]);
	}, [setXY])

	return (
		<div
			style={{
				position: 'fixed',
				bottom: 10,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: '100vw'
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
	const [{ top, xy }, set] = useSpring(() => ({ top: 0, xy: [0, 0, 0] }));

	const scrollRef = useRef(null);

	const [isInDetail, setIsInDetail] = useState(false);

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
						<Canvas>
							<Province
								top={top}
								xy={xy}
								setXY={setXY}
								setScroll={setScroll}
							/>
						</Canvas>
						<CenterNavigation setXY={setXY} setScroll={setScroll} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
