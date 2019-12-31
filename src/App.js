import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Canvas } from 'react-three-fiber';
import { useSpring, a, interpolate } from 'react-spring/three';
import { mapRange } from 'canvas-sketch-util/math';
import { insideCircle } from 'canvas-sketch-util/random';
import bali from './maps/bali.json';
import Maps from './Maps';
import MainMaps from './MainMaps';
import Bahasa from './Bahasa';
import {
	BACKGROUND_COLOR,
	SCROLL_HEIGHT,
	SCROLL_VIEW_HEIGHT,
} from './constants';

function Province({ top, setScroll, isInDetail, setIsInDetail }) {
	const map = bali;
	const provinceName = 'bali';
	const object = map.objects[provinceName];

	const totalMaps = object.geometries.length;
	const v = 2;
	const maxZoom = ((totalMaps * v) + 3);

	const positions = useMemo(() => {
		return object.geometries.reduce((prev, d, i) => {
			const { properties: { kabkot: name } } = d;
			const [x, y] = insideCircle(3);
			const z = (i + 1) * -v;

			return {
				...prev,
				[name]: [x, y, z]
			};
		}, {});
	}, [object.geometries]);

	const [maps, setIsActive] = useState(null);
	// const isInDetail = maps !== null;
	const mapsPosition = positions[maps];

	const [{ xy }, setXY] = useSpring(() => ({ xy: [0, 0] }));

	const [scrollPosition, setScrollPosition] = useState(0);

	const zoomIn = useCallback(position => {
		const [x, y, z] = position;
		const top = mapRange(z - 3, 0, -1 * maxZoom, 0, SCROLL_VIEW_HEIGHT);

		setScroll(top);
		setXY({ xy: [x, y] });

		setScrollPosition(top);
	}, [maxZoom, setScroll, setXY]);

	const zoomOut = useCallback(() => {
		setXY({ xy: [0, 0] });

		setScroll(scrollPosition);
	}, [scrollPosition, setScroll, setXY]);

	const onClick = useCallback((name, position) => {
		return () => {
			if (!isInDetail) {
				setIsInDetail(true);
				setIsActive(name);
				zoomIn(position);
			} else {
				setIsInDetail(false);
				setIsActive(null);
				zoomOut();
			}
		}
	}, [isInDetail, setIsInDetail, zoomIn, zoomOut]);

	const topInterpolator = useCallback((top) => {
		if (isInDetail && maps !== null) {
			return (mapsPosition[2] - 3) * -1;
		}
		return mapRange(top, 0, SCROLL_VIEW_HEIGHT, 0, maxZoom);
	}, [isInDetail, maps, mapsPosition, maxZoom]);

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
						maxZoom={maxZoom}
					/>
				)
			})}
			<Bahasa
				top={top}
				position={mapsPosition}
				isInDetail={isInDetail}
			/>
		</a.group>
	)
}

function App() {
	const [{ top }, set] = useSpring(() => ({
		to: { top: 0 },
	}));

	const scrollRef = useRef(null);

	const [isInDetail, setIsInDetail] = useState(false);

	const setScroll = useCallback((t) => {
		scrollRef.current.scrollTo(0, t);
	}, []);

	const onScroll = useCallback((e) => {
		const top = e.target.scrollTop;
		set({ top });
	}, [set]);

	useEffect(() => {
		if (isInDetail) {
			setScroll(0);
		}
	}, [isInDetail, setScroll]);

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
							// pixelRatio={PIXEL_RATIO}
							style={{
								backgroundColor: BACKGROUND_COLOR
							}}>
							<Province
								top={top}
								setScroll={setScroll}
								isInDetail={isInDetail}
								setIsInDetail={setIsInDetail}
							/>
							{/* <Bahasa
								top={top}
								isInDetail={true}
								position={[0, 0, ]}
							/> */}
						</Canvas>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
