import { mapRange } from 'canvas-sketch-util/math';
import { chunk, uniq } from 'lodash-es';
import { insideSphere, shuffle } from 'canvas-sketch-util/random';
import { maps as mapsData } from '../maps/index.js';
import { COLORS } from '../constants';

import provinsiBahasa from './provinsi-bahasa.json';
import kabkotBahasa from './kabkot-bahasa.json';

const e = shuffle(Object.keys(mapsData));
const m = chunk(e, 6);

export const w = 20;
export const w0 = -w;
export const w1 = w;

const sphereRadius = 3;

export const maps = m.map((d, i) => {
  const x = mapRange(i, 0, m.length - 1, w0 + 2, w1 - 2);

  const child = d.map((key, j) => {
    const r = insideSphere(sphereRadius);
    const ci = (i * 6) + j;

    return [...r, key, COLORS[ci]];
  });

  return {
    parent: [x, 0, 0],
    child,
  }
});

export const mapsColor = maps.map(
  p => p.child
    .reduce((p, c) => (
      { ...p, [c[3]]: c[4] }
    ), {})
).reduce((p, c) => ({ ...p, ...c }), {});

export const order = maps.reduce((prev, curr) =>
  [
    ...prev,
    ...curr.child.map(c => ({
      key: c[3],
      value: c[2],
    }))
  ],
  []
)
  .sort((a, b) => a.value - b.value)
  .reduce((prev, curr) => ({
    ...prev,
    [curr.key]: curr.value,
  }), {});


export const cityBahasa = kabkotBahasa.reduce((prev, curr) => {
  const key = curr.provinsi + "-" + curr.kabkot;
  return {
    ...prev,
    [key]: curr.bahasa
  }
}, {});

export const provinceBahasa = provinsiBahasa.reduce((prev, curr) => {
  return {
    ...prev,
    [curr.provinsi]: curr.bahasa,
  }
}, {});

export const bahasaAll = {
  ...provinceBahasa,
  ...cityBahasa,
};

export const totalBahasa = provinsiBahasa.reduce((p, c) => {
  const key = c.provinsi.toLocaleLowerCase().split(" ").join("-");
  return {
    ...p,
    [key]: c.bahasa.length
  };
}, {});

export const totalAllBahasa = uniq(Object.values(bahasaAll).reduce((p, c) => [...p, ...c], [])).length;

export const totalBahasaPerProvince = Object.keys(provinceBahasa).map(k => ({ province: k, total: provinceBahasa[k].length }));
