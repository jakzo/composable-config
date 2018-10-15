import * as t from 'io-ts';
import { addConvertor } from '../util';

describe('addConvertor()', () => {
  const number = addConvertor(t.number, (m, c) => {
    const n = +(m as any);
    if (isNaN(n)) return t.failure(m, c);
    return t.success(n);
  });

  test('works', () => {
    expect(number.decode('5')).toEqual(t.success(5));
  });

  test('fails when cannot convert', () => {
    const m = 'not a number';
    expect(number.decode(m).isLeft()).toBe(true);
  });

  test('does not modify original type', () => {
    expect(t.number.decode('5').isLeft()).toBe(true);
  });

  test('adds name', () => {
    expect(addConvertor(t.any, t.success, 'test').name).toBe('test');
  });
});
