import * as t from 'io-ts';
import * as ct from '../io';

describe('number', () => {
  test('number', () => {
    expect(ct.number.decode(42)).toEqual(t.success(42));
  });

  test('string', () => {
    expect(ct.number.decode('5')).toEqual(t.success(5));
    expect(ct.number.decode('0xff')).toEqual(t.success(255));
    expect(ct.number.decode('0b101')).toEqual(t.success(5));
    expect(ct.number.decode('x').isLeft()).toBe(true);
  });

  test('others', () => {
    expect(ct.number.decode({}).isLeft()).toBe(true);
    expect(ct.number.decode([1]).isLeft()).toBe(true);
  });
});

describe('string', () => {
  test('string', () => {
    expect(ct.string.decode('x')).toEqual(t.success('x'));
  });

  test('number', () => {
    expect(ct.string.decode(5)).toEqual(t.success('5'));
    expect(ct.string.decode(-123)).toEqual(t.success('-123'));
  });

  test('boolean', () => {
    expect(ct.string.decode(true)).toEqual(t.success('true'));
    expect(ct.string.decode(false)).toEqual(t.success('false'));
  });

  test('others', () => {
    expect(ct.string.decode({}).isLeft()).toBe(true);
    expect(ct.string.decode([1, 2, 3])).toEqual(
      t.failure([1, 2, 3], t.getDefaultContext(ct.string)),
    );
  });
});

describe('boolean', () => {
  test('boolean', () => {
    expect(ct.boolean.decode(true)).toEqual(t.success(true));
    expect(ct.boolean.decode(false)).toEqual(t.success(false));
  });

  test('string', () => {
    expect(ct.boolean.decode('true')).toEqual(t.success(true));
    expect(ct.boolean.decode('TrUe')).toEqual(t.success(true));
    expect(ct.boolean.decode('false')).toEqual(t.success(false));
    expect(ct.boolean.decode('FaLse')).toEqual(t.success(false));
    expect(ct.boolean.decode('')).toEqual(t.success(false));
    expect(ct.boolean.decode('0')).toEqual(t.success(false));
    expect(ct.boolean.decode('1')).toEqual(t.success(true));
    expect(ct.boolean.decode('99').isLeft()).toBe(true);
    expect(ct.boolean.decode('yes').isLeft()).toBe(true);
  });

  test('number', () => {
    expect(ct.boolean.decode(0)).toEqual(t.success(false));
    expect(ct.boolean.decode(1)).toEqual(t.success(true));
    expect(ct.boolean.decode(99).isLeft()).toBe(true);
    expect(ct.boolean.decode(-1).isLeft()).toBe(true);
  });

  test('others', () => {
    expect(ct.boolean.decode({}).isLeft()).toBe(true);
    expect(ct.boolean.decode([true]).isLeft()).toBe(true);
  });
});

describe('array()', () => {
  test('array', () => {
    expect(ct.array(ct.number).decode([1, 2, 3])).toEqual(t.success([1, 2, 3]));
    expect(ct.array(ct.string).decode([1, 2, 3])).toEqual(t.success(['1', '2', '3']));
  });

  test('string', () => {
    expect(ct.array(ct.number).decode('1,2,3')).toEqual(t.success([1, 2, 3]));
    expect(ct.array(ct.string).decode('1,2,3')).toEqual(t.success(['1', '2', '3']));
    expect(ct.array(ct.string, ' ').decode('x y,y  z')).toEqual(t.success(['x', 'y,y', '', 'z']));
    expect(ct.array(ct.string, '').decode('xyz')).toEqual(t.success(['x', 'y', 'z']));
    expect(ct.array(ct.string, / +/).decode('x y,y   z')).toEqual(t.success(['x', 'y,y', 'z']));
  });

  test('others', () => {
    const numArrType = ct.array(ct.number);
    expect(numArrType.decode({}).isLeft()).toBe(true);
    expect(numArrType.decode(3).isLeft()).toBe(true);
  });
});

describe('Integer', () => {
  test('Integer string', () => {
    expect(ct.Integer.decode('5')).toEqual(t.success(5));
  });

  test('hex string', () => {
    expect(ct.Integer.decode('0xff')).toEqual(t.success(255));
  });

  test('binary string', () => {
    expect(ct.Integer.decode('0b101')).toEqual(t.success(5));
  });

  test('non-Integer string', () => {
    expect(ct.Integer.decode('x').isLeft()).toBe(true);
  });

  test('non-Integer object', () => {
    const m = {};
    expect(ct.Integer.decode(m).isLeft()).toBe(true);
  });

  test('non-Integer number', () => {
    expect(ct.Integer.decode(1.1).isLeft()).toBe(true);
  });
});
