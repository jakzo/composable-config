import * as t from 'io-ts';
import { isConfigTypeDescriptor, mapShape } from '../shape';

describe('mapShape()', () => {
  test('works', () => {
    expect(
      mapShape(
        { a: t.number, x: { b: t.number }, y: {}, c: t.number },
        (_, key) => (({ a: 1, b: 2, c: 3 } as any)[key]),
      ),
    ).toEqual({ a: 1, x: { b: 2 }, y: {}, c: 3 });
  });

  test('comprehensive', () => {
    const traced: any[][] = [];

    expect(
      mapShape(
        {
          a: t.number,
          b: {
            c: { _: t.string, default: 1, other: 2 },
            d: t.null,
          },
          e: t.boolean,
        },
        (type, key) => {
          const { _, ...others } = type;
          traced.push(['onType', key, _.name, others]);
          return ({
            a: 1,
            c: '2',
            d: null,
            e: true,
          } as any)[key];
        },
        key => {
          traced.push(['onEntry', key]);
        },
        () => {
          traced.push(['onExit']);
        },
      ),
    ).toEqual({
      a: 1,
      b: {
        c: '2',
        d: null,
      },
      e: true,
    });

    expect(traced).toEqual([
      ['onType', 'a', 'number', {}],
      ['onEntry', 'b'],
      ['onType', 'c', 'string', { default: 1, other: 2 }],
      ['onType', 'd', 'null', {}],
      ['onExit'],
      ['onType', 'e', 'boolean', {}],
    ]);
  });

  test('invalid shape value', () => {
    expect(() => {
      mapShape({ a: 1 } as any, () => {});
    }).toThrow();
  });
});

describe('isConfigTypeDescriptor()', () => {
  test('empty', () => {
    expect(isConfigTypeDescriptor({})).toBe(false);
  });

  test('is', () => {
    expect(isConfigTypeDescriptor({ _: t.number })).toBe(true);
  });

  test('is not', () => {
    expect(isConfigTypeDescriptor({ x: t.number })).toBe(false);
  });
});
