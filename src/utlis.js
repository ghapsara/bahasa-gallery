export function getPixelRatio() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const bsr = ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || 1;

  return dpr / bsr;
}

export function createCanvas(width, height) {
  const pixelRatio = getPixelRatio();

  const canvas = document.createElement('canvas');

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  return canvas;
};


// function drawTextAlongArc(context, str, centerX, centerY, radius, angle) {
//   var len = str.length, s;
//   context.save();
//   context.translate(centerX, centerY);
//   context.rotate(-1 * angle / 2);
//   context.rotate(-1 * (angle / len) / 2);
//   for (var n = 0; n < len; n++) {
//     context.rotate(angle / len);
//     context.save();
//     context.translate(0, -1 * radius);
//     s = str[n];
//     context.fillText(s, 0, 0);
//     context.restore();
//   }
//   context.restore();
// }

// function mapsPath(map, name) {
// 	const features = mesh(map, map.objects[name]);

// 	const projection = geoMercator().fitSize([WIDTH, HEIGHT], features);
// 	const path = geoPath(projection)

// 	return map.objects[name].geometries.map(d => {
// 		const p = mesh(map, d);
// 		return path(p);
// 	});
// };

// function mapsPathFeature(map, name) {
// 	const features = feature(map, map.objects[name]);

// 	const projection = geoMercator().fitSize([WIDTH, HEIGHT], features);
// 	const path = geoPath().projection(projection);

// 	return path(features);
// }


export default {
  getPixelRatio,
  createCanvas
}