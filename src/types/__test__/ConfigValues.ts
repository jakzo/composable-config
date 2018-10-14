import { ConfigValues } from '../shape';
import * as ct from '../../io';

const shape = {
  a: ct.number,
  x: {
    b: ct.string,
    y: {
      c: { _: ct.boolean, default: true },
      d: ct.Integer,
    },
  },
  e: { _: ct.Port },
  z: {},
  f: ct.array(ct.number),
};

// $ExpectType { a: number; x: { b: string; y: { c: boolean; d: number; }; }; e: number; z: {}; f: number[]; }
const values: ConfigValues<typeof shape> = {
  a: 1.1,
  x: {
    b: 'b',
    y: {
      c: false as boolean,
      d: 2,
    },
  },
  e: 8080,
  z: {},
  f: [1, 2, 3],
};
