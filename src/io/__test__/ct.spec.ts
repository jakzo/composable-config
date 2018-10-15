import * as t from 'io-ts';
import * as ct from '../ct';

describe('Port', () => {
  test('valid', () => {
    expect(ct.Port.decode(8080)).toEqual(t.success(8080));
    expect(ct.Port.decode(1)).toEqual(t.success(1));
    expect(ct.Port.decode(0xffff)).toEqual(t.success(0xffff));
  });

  test('too low', () => {
    expect(ct.Port.decode(0).isLeft()).toBe(true);
    expect(ct.Port.decode(-1).isLeft()).toBe(true);
  });

  test('too high', () => {
    expect(ct.Port.decode(0x10000).isLeft()).toBe(true);
    expect(ct.Port.decode(0xfffff).isLeft()).toBe(true);
  });

  test('string', () => {
    expect(ct.Port.decode('8080')).toEqual(t.success(8080));
  });
});

describe('Json', () => {
  test('valid', () => {
    expect(ct.Json.decode('{"a":1,"x":{"b":"q","c":false},"d":9,"y":{}}')).toEqual(
      t.success({ a: 1, x: { b: 'q', c: false }, d: 9, y: {} }),
    );
    expect(ct.Json.decode('1')).toEqual(t.success(1));
    expect(ct.Json.decode(1)).toEqual(t.success(1));
    expect(ct.Json.decode('true')).toEqual(t.success(true));
    expect(ct.Json.decode(true)).toEqual(t.success(true));
    expect(ct.Json.decode('{  }')).toEqual(t.success({}));
    expect(ct.Json.decode({ a: 1 })).toEqual(t.success({ a: 1 }));
  });

  test('invalid', () => {
    expect(ct.Json.decode('{a:1}').isLeft()).toBe(true);
    expect(ct.Json.decode('{"a":1').isLeft()).toBe(true);
    expect(ct.Json.decode('.123').isLeft()).toBe(true);

    const func = () => {};
    expect(ct.Json.decode(func).isLeft()).toBe(true);
  });
});
