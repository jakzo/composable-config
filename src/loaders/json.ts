import { readFileSync } from 'fs';
import { parse } from 'json5';
import { some, none } from 'fp-ts/lib/Option';
import { ConfigDefaultsLoader } from '../types/options';

export interface Options {
  /** Node.js file encoding to read the file using. */
  encoding?: string;
  /** Throw an exception if there is an error when reading or parsing the file. */
  throwOnError?: boolean;
}

/**
 * Returns a loader which reads config values from a JSON file.
 * @param filePath Path to the JSON file, relative to `process.cwd()`.
 */
export default function jsonLoader(
  filePath: string,
  { encoding = 'utf8', throwOnError = false }: Options = {},
): ConfigDefaultsLoader {
  return {
    getDefaults() {
      try {
        const contents = readFileSync(filePath, { encoding });
        return some(parse(contents));
      } catch (err) {
        if (throwOnError) throw err;
      }
      return none;
    },
  };
}
