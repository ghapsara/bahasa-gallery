import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
import { useSpring } from 'react-spring/three';
import Bahasa from './Bahasa';
import {
	BACKGROUND_COLOR,
	SCROLL_HEIGHT,
	SCROLL_WIDTH,
} from './constants';

import Gallery from './Gallery';
import Province from './Province';

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
