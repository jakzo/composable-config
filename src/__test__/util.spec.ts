import { isConfigTypeLoader } from '../util';
import { none } from 'fp-ts/lib/Option';

describe('isConfigTypeLoader()', () => {
  test('is', () => {
    expect(
      isConfigTypeLoader({
        onType() {
          return none;
        },
      }),
    ).toBe(true);
  });

  test('is not', () => {
    expect(
      isConfigTypeLoader({
        getDefaults() {
          return {};
        },
      }),
    ).toBe(false);
  });
});
