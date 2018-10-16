/**
 * All types in this file are extended from:
 * https://github.com/gcanti/io-ts/blob/master/src/index.ts
 */

import * as t from 'io-ts';
import { conversion } from './util';

/* tslint:disable:variable-name */

const numberConverter = (m: t.mixed, c: t.Context): t.Validation<number> => {
  if (Array.isArray(m)) return t.failure(m, c);
  const n = Number(m);
  if (isNaN(n)) return t.failure(m, c);
  return t.success(n);
};
export const number = conversion(t.number, numberConverter);

export const string = conversion(t.string, (m, c) => {
  if (typeof m === 'object' || m == null) return t.failure(m, c);
  return t.success(String(m));
});

export const boolean = conversion(t.boolean, (m, c) => {
  switch (typeof m === 'string' ? m.toLowerCase() : m) {
    case true:
    case 1:
    case 'true':
    case '1':
      return t.success(true);

    case false:
    case 0:
    case 'false':
    case '0':
    case '':
      return t.success(false);
  }
  return t.failure(m, c);
});

export const array = <T extends t.Mixed>(
  type: T,
  separator: string | RegExp | null = ',',
  name?: string,
) =>
  conversion(t.array(type, name), (m, c) => {
    if (Array.isArray(m)) return t.success(m);
    if (separator != null && typeof m === 'string') return t.success(m.split(separator));
    return t.failure(m, c);
  });

export const Integer = conversion(t.Integer, numberConverter);
