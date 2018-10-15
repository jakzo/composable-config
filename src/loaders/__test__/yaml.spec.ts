import { writeFile } from 'fs-extra';
import { file } from 'tempy';
import { safeDump } from 'js-yaml';
import { none, some } from 'fp-ts/lib/Option';
import yamlLoader from '../yaml';

describe('loader', () => {
  const testFileName = 'test.yaml';
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
      await writeFile(filename, safeDump(contents));
    });

    test('works', () => {
      expect(yamlLoader(filename).getDefaults()).toEqual(some(contents));
    });
  });

  describe('with other encoding', () => {
    const filename = file({ name: testFileName });

    beforeEach(async () => {
      await writeFile(filename, safeDump(contents), { encoding: 'ucs2' });
    });

    test('works', () => {
      expect(yamlLoader(filename, { encoding: 'ucs2' }).getDefaults()).toEqual(some(contents));
    });
  });

  describe('missing file', () => {
    const filename = file({ name: testFileName });

    test('works', () => {
      expect(yamlLoader(filename).getDefaults()).toEqual(none);
    });

    test('throws', () => {
      expect(() => yamlLoader(filename, { throwOnError: true }).getDefaults()).toThrow();
    });
  });
});
