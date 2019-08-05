import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useRender, useThree, useUpdate } from 'react-three-fiber';
import { useSpring, a, interpolate } from 'react-spring/three';
import { geoMercator, geoPath } from 'd3';
import { feature } from 'topojson-client';
import { getPixelRatio, createCanvas } from './utlis';
import fontJson from './font/noto-sans-regular.json';
import mapJson from './maps/bali-simplified-topo.json';

const pixelRatio = getPixelRatio();
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const BACKGROUND_COLOR = '#272727';
const COLOR = '#1ee3cf';
const COLOR_1 = '#fff78f';
const SCROLL_HEIGHT = 5 * HEIGHT;

function Maps() {
	const ref = useRef();
	const canvas = useMemo(() => {
		const canvasWidth = 2048;
		const canvasHeight = 2048;
		const canvas = createCanvas(canvasWidth, canvasHeight);
		const context = canvas.getContext('2d');

		const mapMesh = feature(
			mapJson,
			mapJson.objects.bali,
			(a, b) => a !== b
		);

		const width = canvasWidth * pixelRatio;
		const height = canvasHeight * pixelRatio;

		const projection = geoMercator().fitSize([width - 200, height - 200], mapMesh);
		const path = geoPath(
			projection, context
		);

		// context.beginPath();
		// context.lineWidth = 20;
		// context.fillStyle = COLOR;
		// context.fillRect(0, 0, width, height);

		context.translate(100, 100);

		context.beginPath();
		path(mapMesh);
		context.fillStyle = COLOR;
		context.fill();

		// context.beginPath();
		// path(mapMesh);
		// context.lineWidth = 10;
		// context.strokeStyle = COLOR;
		// context.stroke();

		return canvas;
	}, []);

	return (
		<mesh ref={ref} position={[0, 0, 0]}>
			<meshBasicMaterial attach="material">
				<canvasTexture attach="map" image={canvas} />
			</meshBasicMaterial>
			{/* <planeBufferGeometry attach="geometry" args={[7, 7, 7]} /> */}
			<boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
		</mesh>
	)
}

function Title({ text, ...props }) {
	const font = useMemo(() => new THREE.FontLoader().parse(fontJson), []);
	const geometry = new THREE.TextGeometry(text, {
		font,
		size: 1,
		height: 0
	}).center();

	return (
		<group {...props} onClick={e => {
			console.log('clikc')
		}}>
			{/* <Maps /> */}
			<mesh geometry={geometry} >
				<meshBasicMaterial
					attach="material"
					color={COLOR}
				/>
			</mesh>
		</group>
	);
}

function Locations({ top }) {
	const locs = ['delicate', 'irresistible', 'tangible'];

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

function Box({ top }) {
	return (
		<a.mesh
			onPointerOver={e => console.log('hover')}
			scale={top.interpolate([0, SCROLL_HEIGHT], [1, 5]).interpolate(t => [t, t, t])}
		>
			<meshBasicMaterial attach="material" color={COLOR} />
			<boxGeometry attach="geometry" args={[1, 1, 1]} />
		</a.mesh>
	);
}

function App() {
	const [{ top }, setTop] = useSpring(() => ({ top: 0 }));

	const onScroll = useCallback((e) => {
		setTop({ top: e.target.scrollTop })
	}, [setTop]);

	return (
		<div style={{
			width: '100%',
			height: '100vh',
		}}>
			<div
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
						<Canvas pixelRatio={pixelRatio}>
							<Locations top={top} />
						</Canvas>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
