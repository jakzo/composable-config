import * as t from 'io-ts';
import * as ct from '../ct';

describe('Port', () => {
  test('valid', () => {
    expect(ct.Port.decode(8080)).toEqual(t.success(8080));
    expect(ct.Port.decode(1)).toEqual(t.success(1));
    expect(ct.Port.decode(0xffff)).toEqual(t.success(0xffff));
  });

  test('too low', () => {
    expect(ct.Port.decode(0)).toEqual(t.failure(0, t.getDefaultContext(ct.Port)));
    expect(ct.Port.decode(-1)).toEqual(t.failure(-1, t.getDefaultContext(ct.Port)));
  });

  test('too high', () => {
    expect(ct.Port.decode(0x10000)).toEqual(t.failure(0x10000, t.getDefaultContext(ct.Port)));
    expect(ct.Port.decode(0xfffff)).toEqual(t.failure(0xfffff, t.getDefaultContext(ct.Port)));
  });

  test('string', () => {
    expect(ct.Port.decode('8080')).toEqual(t.success(8080));
  });
});
