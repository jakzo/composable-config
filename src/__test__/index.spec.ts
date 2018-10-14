import * as t from 'io-ts';
import { createConfig, buildConfig } from '../';
import { ConfigLoader } from '../types/options';

jest.mock('../build', () => ({ build: jest.fn().mockImplementation((...args: any[]) => args) }));

test('createConfig()', () => {
  const value = {};
  expect(createConfig(value)).toBe(value);
});

describe('buildConfig()', () => {
  test('empty', async () => {
    const config = await buildConfig({
      config: {},
    });
    expect(config).toEqual([{}, [], [{}]]);
  });

  test('loader defaults', async () => {
    const testLoader: ConfigLoader = {
      getDefaults() {
        return { a: 1 };
      },
    };
    const config = await buildConfig({
      config: { a: t.number },
      loaders: [testLoader],
      defaults: {
        a: 2,
      },
    });
    expect(config).toEqual([{ a: t.number }, [], [{ a: 1 }, { a: 2 }]]);
  });

  test('loader without defaults', async () => {
    const testLoader: ConfigLoader = {};
    const config = await buildConfig({
      config: { a: t.number },
      loaders: [testLoader],
      defaults: {
        a: 2,
      },
    });
    expect(config).toEqual([{ a: t.number }, [], [{}, { a: 2 }]]);
  });
});
