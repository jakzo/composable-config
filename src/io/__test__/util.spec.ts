import * as t from 'io-ts';
import { typeWithConversion } from '../util';

describe('typeWithConversion()', () => {
  const number = typeWithConversion(t.number, (m, c) => {
    const n = +(m as any);
    if (isNaN(n)) return t.failure(m, c);
    return t.success(n);
  });

  test('works', () => {
    expect(number.decode('5')).toEqual(t.success(5));
  });

  test('fails when cannot convert', () => {
    const m = 'not a number';
    expect(number.decode(m)).toEqual(t.failure(m, t.getDefaultContext(number)));
  });

  test('does not modify original type', () => {
    expect(t.number.decode('5')).toEqual(t.failure('5', t.getDefaultContext(t.number)));
  });
});
