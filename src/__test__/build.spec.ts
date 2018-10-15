import * as t from 'io-ts';
import { some, none } from 'fp-ts/lib/Option';
import { build, getDefaultValue } from '../build';
import * as ct from '../io';

// TODO
describe('build()', () => {
  describe('defaults', () => {
    test('work', async () => {
      const defaults = {
        a: 1,
        b: 2,
        c: 3,
      };
      const config = build(
        {
          a: t.number,
          b: t.number,
          c: t.number,
        },
        [],
        [defaults],
      );
      expect(config).toEqual(defaults);
    });

    test('conversion', async () => {
      expect(
        build(
          {
            a: ct.number,
            b: ct.number,
            c: ct.number,
          },
          [],
          [{ a: 3, b: '2', c: true }],
        ),
      ).toEqual({ a: 3, b: 2, c: 1 });
    });

    test('nested', async () => {
      const defaults = {
        a: 1,
        x: {
          b: 2,
          y: {
            c: 3,
          },
        },
      };
      const config = build(
        {
          a: t.number,
          x: {
            b: t.number,
            y: {
              c: t.number,
            },
          },
        },
        [],
        [defaults],
      );
      expect(config).toEqual(defaults);
    });

    test('different shape', async () => {
      expect(
        build(
          {
            a: t.number,
            x: {
              b: t.number,
              y: {
                c: { _: t.number, default: 9 },
              },
            },
            d: t.number,
          },
          [],
          [
            {
              a: 1,
              x: {
                b: 2,
              },
              d: 3,
            },
          ],
        ),
      ).toEqual({
        a: 1,
        x: {
          b: 2,
          y: {
            c: 9,
          },
        },
        d: 3,
      });
    });

    test('fall-through', async () => {
      expect(
        build(
          {
            a: t.number,
            b: { _: t.number, default: -1 },
            c: { _: t.number, default: 3 },
            x: {
              d: t.number,
            },
          },
          [],
          [
            { a: 1 },
            { a: -1, b: 2 },
            {
              b: -1,
              x: {
                d: 4,
              },
            },
          ],
        ),
      ).toEqual({
        a: 1,
        b: 2,
        c: 3,
        x: {
          d: 4,
        },
      });
    });

    test('unused defaults', async () => {
      expect(build({ a: t.number }, [], [{ ignored: 9 }, { a: 1 }])).toEqual({ a: 1 });
    });

    test('missing', async () => {
      const defaults = {
        a: 1,
        x: {
          y: {
            c: 3,
          },
        },
      };
      expect(() =>
        build(
          {
            a: t.number,
            x: {
              b: t.number,
              y: {
                c: t.number,
              },
            },
          },
          [],
          [defaults],
        ),
      ).toThrow();
    });

    test('invalid type', async () => {
      expect(() => build({ a: t.number }, [], [{ a: 'not a number' }])).toThrow();
    });
  });

  describe('loaders', () => {
    test('work', () => {
      expect(
        build(
          { a: { _: t.number, x: 1 }, b: { _: t.number, x: 2 } },
          [
            {
              onType(type) {
                return type.x === 2 ? some(1) : none;
              },
            },
          ],
          [{ a: 0, b: 0 }],
        ),
      ).toEqual({ a: 0, b: 1 });
    });
  });

  describe('shape', () => {
    describe('type descriptors', () => {
      test('work', async () => {
        const defaults = {
          a: 1,
          x: {
            b: 2,
            y: {
              c: 3,
            },
          },
        };
        const config = build(
          {
            a: t.number,
            x: {
              b: { _: t.number },
              y: {
                c: t.number,
              },
            },
          },
          [],
          [defaults],
        );
        expect(config).toEqual(defaults);
      });

      test('defaults', async () => {
        expect(
          build(
            {
              a: { _: t.boolean, default: false },
              x: {
                b: { _: t.boolean },
                c: { _: t.boolean, default: true },
              },
              d: { _: t.boolean, default: true },
            },
            [],
            [
              {
                a: true,
                x: {
                  b: true,
                },
              },
            ],
          ),
        ).toEqual({
          a: true,
          x: {
            b: true,
            c: true,
          },
          d: true,
        });
      });
    });
  });
});

describe('getDefaultValue()', () => {
  test('empty', () => {
    expect(getDefaultValue([], [], 'x', { _: t.any })).toEqual(none);
  });

  test('matches default', () => {
    expect(getDefaultValue([], [{ a: 1, x: 2, z: 3 }], 'x', { _: t.any })).toEqual(some(2));
  });

  test('matches first in list', () => {
    const result = getDefaultValue(
      [],
      [{ a: 1 }, { x: 2 }, { x: 3, y: 4 }, { b: 5 }, { x: 6 }],
      'x',
      { _: t.any },
    );
    expect(result).toEqual(some(2));
  });

  test('matches type', () => {
    expect(
      getDefaultValue(
        [
          {
            onType() {
              return some(2);
            },
          },
        ],
        [{ x: 1 }],
        'x',
        { _: t.any },
      ),
    ).toEqual(some(2));
  });

  test('skips unmatched type', () => {
    expect(
      getDefaultValue(
        [
          {
            onType() {
              return none;
            },
          },
        ],
        [{ x: 1 }],
        'x',
        { _: t.any },
      ),
    ).toEqual(some(1));
  });
});
