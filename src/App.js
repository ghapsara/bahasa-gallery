import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Canvas } from 'react-three-fiber';
import { useSpring, a, interpolate, config } from 'react-spring/three';
import { mapRange } from 'canvas-sketch-util/math';
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

function Province({ top, setScroll, isInDetail, setIsInDetail }) {
	const map = bali;
	const provinceName = 'bali';
	const object = map.objects[provinceName];

	const totalMaps = object.geometries.length;
	const v = 3;
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

	const [maps, setMaps] = useState(null);
	// const isInDetail = maps !== null;
	const mapsPosition = positions[maps];

	const [{ xy }, setXY] = useSpring(() => ({ xy: [0, 0] }));

	const [scrollPosition, setScrollPosition] = useState(0);

	const zoomIn = useCallback(position => {
		const [x, y, z] = position;
		const top = mapRange(z - 3, 0, -1 * maxZoom, 0, SCROLL_VIEW_HEIGHT);

		setScroll(0, top);
		setXY({ xy: [x, y] });

		setScrollPosition(top);
	}, [maxZoom, setScroll, setXY]);

	const zoomOut = useCallback(() => {
		setXY({ xy: [0, 0] });

		setScroll(0, scrollPosition);
	}, [scrollPosition, setScroll, setXY]);

	const onClick = useCallback((name, position) => {
		return () => {
			if (!isInDetail) {
				setIsInDetail(true);
				setMaps(name);
				zoomIn(position);
			} else {
				setIsInDetail(false);
				setMaps(null);
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
						top={top}
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
	const [{ top, left }, set] = useSpring(() => ({
		from: { top: 0, left: 0 },
		config: config.slow,
	}));

	const scrollRef = useRef(null);

	const [isInDetail, setIsInDetail] = useState(false);

	const setScroll = useCallback((l, t) => {
		scrollRef.current.scrollTo(l, t);
	}, []);

	const onScroll = useCallback((e) => {
		const top = e.target.scrollTop;
		const left = e.target.scrollLeft;

		set({ top, left });
	}, [set]);

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

	// useEffect(() => {
	// 	if (isInDetail) {
	// 		setScroll(0);
	// 	}
	// }, [isInDetail, setScroll]);

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
							<Province
								top={top}
								setScroll={setScroll}
								isInDetail={isInDetail}
								setIsInDetail={setIsInDetail}
							/>
							{/* <Gallery
								top={top}
								left={left}
								setScroll={setScroll}
							/> */}
						</Canvas>
						{/* <Search /> */}
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
