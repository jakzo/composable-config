import * as t from 'io-ts';
import envLoader from '../env';
import { none, some } from 'fp-ts/lib/Option';

describe('loader', () => {
  beforeEach(() => {
    process.env['TEST_KEY'] = '123';
  });

  afterEach(() => {
    delete process.env['TEST_KEY'];
  });

  test('works', () => {
    expect(envLoader().onType({ _: t.number, env: 'TEST_KEY' })).toEqual(some('123'));
    expect(envLoader().onType({ _: t.number, env: 'NON_EXISTANT_123123123' })).toEqual(none);
    expect(envLoader().onType({ _: t.number })).toEqual(none);
  });
});
