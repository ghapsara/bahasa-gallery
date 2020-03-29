import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
import { useSpring } from 'react-spring/three';
import { BACKGROUND_COLOR, SCROLL_HEIGHT, SCROLL_WIDTH, PIXEL_RATIO, SCROLL_VIEW_HEIGHT, SCROLL_TOP } from './constants';
import Gallery from './Gallery';
import Province from './Province';
import Bahasa from './Bahasa';
import Tooltip from './Tooltip';

function App() {
	const scrollRef = useRef(null);
	const galleryRef = useRef(false);
	const galleryTooltipRef = useRef(null);
	const bahasaRef = useRef(false);
	const bahasaScrollTooltipRef = useRef(null);
	const bahasaCloseTooltipRef = useRef(null);
	const provinceRef = useRef(false);
	const provinceTooltipRef = useRef(null);

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
			if (galleryRef.current) {
				galleryTooltipRef.current.style.display = "table";
			}
			if (!galleryRef.current) {
				galleryTooltipRef.current.style.display = "none";
			}
			galleryRef.current = false;
		}

		if (provinceRef.current) {
			if (top < SCROLL_TOP) {
				provinceTooltipRef.current.style.display = "table";
			}
			if (top >= SCROLL_TOP && top <= SCROLL_VIEW_HEIGHT) {
				provinceTooltipRef.current.style.display = "none";
			}
			if (top >= SCROLL_VIEW_HEIGHT) {
				provinceTooltipRef.current.style.display = "table";
			}
		}

		if (bahasaRef.current) {
			if (top < SCROLL_TOP) {
				bahasaScrollTooltipRef.current.style.display = "table";
			}
			if (top >= SCROLL_TOP) {
				bahasaScrollTooltipRef.current.style.display = "none";
			}

			if (top < SCROLL_VIEW_HEIGHT) {
				bahasaCloseTooltipRef.current.style.display = "none";
			}
			if (top >= SCROLL_VIEW_HEIGHT) {
				bahasaCloseTooltipRef.current.style.display = "table";
			}
		}

		if (!bahasaRef.current) {
			bahasaScrollTooltipRef.current.style.display = "none";
			bahasaCloseTooltipRef.current.style.display = "none";
		}
	}, [set, active]);

	const setScroll = useCallback((l, t) => {
		scrollRef.current.scrollTo(l, t);
	}, []);

	const setGalleryTooltip = (isVisible) => {
		galleryRef.current = isVisible;

		const display = isVisible ? "table" : "none";
		galleryTooltipRef.current.style.display = display;
	};

	const setProvinceTooltip = (isVisible) => {
		provinceRef.current = isVisible;

		const display = isVisible ? "table" : "none";
		provinceTooltipRef.current.style.display = display;
	};

	const setBahasaTooltip = (type, isVisible) => {
		bahasaRef.current = isVisible;

		const display = isVisible ? "table" : "none";
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

	const displayGallery = useCallback(() => {
		setProvinceTooltip(false);
		setScroll(0, 0);
		setProvince(null);
		setCity(null);
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
										setProvinceTooltip={setProvinceTooltip}
										setBahasaTooltip={setBahasaTooltip}
									/>
								</>}
							<Tooltip
								bahasaCloseTooltipRef={bahasaCloseTooltipRef}
								bahasaScrollTooltipRef={bahasaScrollTooltipRef}
								galleryTooltipRef={galleryTooltipRef}
								provinceTooltipRef={provinceTooltipRef}
								displayGallery={displayGallery}
							/>
						</Canvas>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
