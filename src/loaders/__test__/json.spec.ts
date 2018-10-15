import { writeJson } from 'fs-extra';
import { file } from 'tempy';
import { none, some } from 'fp-ts/lib/Option';
import jsonLoader from '../json';

describe('loader', () => {
  const testFileName = 'test.json';
  const contents = {
    a: 1,
    b: {
      c: '🤪',
      e: true,
    },
    f: 0,
  };

  describe('with contents', () => {
    const filename = file({ name: testFileName });

    beforeEach(async () => {
      await writeJson(filename, contents);
    });

    test('works', () => {
      expect(jsonLoader(filename).getDefaults()).toEqual(some(contents));
    });
  });

  describe('with other encoding', () => {
    const filename = file({ name: testFileName });

    beforeEach(async () => {
      await writeJson(filename, contents, { encoding: 'ucs2' });
    });

    test('works', () => {
      expect(jsonLoader(filename, { encoding: 'ucs2' }).getDefaults()).toEqual(some(contents));
    });
  });

  describe('missing file', () => {
    const filename = file({ name: testFileName });

    test('works', () => {
      expect(jsonLoader(filename).getDefaults()).toEqual(none);
    });

    test('throws', () => {
      expect(() => jsonLoader(filename, { throwOnError: true }).getDefaults()).toThrow();
    });
  });
});
