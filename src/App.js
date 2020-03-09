import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
import { useSpring } from 'react-spring/three';
import { BACKGROUND_COLOR, SCROLL_HEIGHT, SCROLL_WIDTH, PIXEL_RATIO, SCROLL_VIEW_HEIGHT, SCROLL_TOP } from './constants';
import Gallery from './Gallery';
import Province from './Province';
import Bahasa from './Bahasa';

function App() {
	const scrollRef = useRef(null);
	const galleryTooltipRef = useRef(null);
	const bahasaScrollTooltipRef = useRef(null);
	const bahasaCloseTooltipRef = useRef(null);
	const provinceTooltipRef = useRef(null);

	const tooltipVisiblityRef = useRef(false);

	const [active, setActive] = useState(null);

	const [province, setProvince] = useState(null);
	const [city, setCity] = useState(null);

	const [{ left, top, top1 }, set] = useSpring(() => ({
		left: 0,
		top: 0,
		top1: 0,
	}));

	const onScroll = useCallback((e) => {
		const top = e.target.scrollTop;
		set({
			top: active || top,
			left: e.target.scrollLeft,
			top1: active !== null ? top : 0,
		});

		if (galleryTooltipRef.current) {
			if (tooltipVisiblityRef.current) {
				galleryTooltipRef.current.style.display = "";
			}
			if (!tooltipVisiblityRef.current) {
				galleryTooltipRef.current.style.display = "none";
			}
			tooltipVisiblityRef.current = false;
		}

		if (bahasaScrollTooltipRef.current) {
			if (top < SCROLL_TOP) {
				bahasaScrollTooltipRef.current.style.display = "";
			}
			if (top >= SCROLL_TOP) {
				bahasaScrollTooltipRef.current.style.display = "none";
			}
		}

		if (bahasaCloseTooltipRef.current) {
			if (top < SCROLL_VIEW_HEIGHT) {
				bahasaCloseTooltipRef.current.style.display = "none";
			}
			if (top >= SCROLL_VIEW_HEIGHT) {
				bahasaCloseTooltipRef.current.style.display = "";
			}
		}

		// if (provinceTooltipRef.current && city === null) {
		// 	if (top < SCROLL_TOP) {
		// 		provinceTooltipRef.current.style.display = "";
		// 	}
		// 	if (top >= SCROLL_TOP) {
		// 		provinceTooltipRef.current.style.display = "none";
		// 	}
		// }
	}, [set, active]);

	const setScroll = useCallback((l, t) => {
		scrollRef.current.scrollTo(l, t);
	}, []);

	const setGalleryTooltip = (isVisible) => {
		tooltipVisiblityRef.current = isVisible;

		const display = isVisible ? "" : "none";

		galleryTooltipRef.current.style.display = display;
	};

	const setBahasaTooltip = (type, isVisible) => {
		const display = isVisible ? "" : "none";
		if (type === "scroll") {
			bahasaScrollTooltipRef.current.style.display = display;
		}
		if (type === "close") {
			bahasaCloseTooltipRef.current.style.display = display;
		}
	}

	const setTop = useCallback((position, isActive) => {
		set({ top: position });

		setActive(isActive ? position : null);
		setScroll(0, isActive ? 0 : position);
	}, [set, setScroll]);

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
					<div className="canvas-container" style={{
						backgroundColor: BACKGROUND_COLOR
					}}>
						<Canvas
							// pixelRatio={PIXEL_RATIO}
							style={{
								backgroundColor: BACKGROUND_COLOR
							}}
						>
							{province === null &&
								<Gallery
									top={top}
									left={left}
									setScroll={setScroll}
									setLocation={setProvince}
									setTooltip={setGalleryTooltip}
									tooltipRef={galleryTooltipRef}
								/>
							}
							{province !== null &&
								<>
									{active !== null &&
										<Bahasa
											top={top1}
											province={province}
											city={city}
											scrollTooltipRef={bahasaScrollTooltipRef}
											closeTooltipRef={bahasaCloseTooltipRef}
											setTooltip={setBahasaTooltip}
										/>
									}
									<Province
										top={top}
										setTop={setTop}
										name={province}
										setCity={setCity}
										tooltipRef={provinceTooltipRef}
										close={() => console.log('ss')}
									/>
								</>}
						</Canvas>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
