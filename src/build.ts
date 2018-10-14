import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { Option, none, some } from 'fp-ts/lib/Option';
import { ConfigShape, ConfigValuesTypeSafe, ConfigShapeTypeDescriptor } from './types/shape';
import { AnyDict } from './types/util';
import { mapShape } from './shape';
import { ConfigError } from './util';
import { ConfigTypeLoader } from './types/options';

/**
 * Builds the config values of a shape based on a list of value dictionaries.
 *
 * The first value dictionary in the list with a key matching the one in the shape will be used.
 * @param loaders List of config loaders which have `onType()` properties.
 *   The first loader in the list which returns a value for the type will be used.
 * @param defaultDict List of default value objects matching the shape of `shape`.
 *   The first list with a default value set will be the one used.
 *   These default objects are only checked if no loader matches for the specific type.
 */
export const build = <S extends ConfigShape, L extends ConfigTypeLoader>(
  shape: S,
  loaders: L[],
  defaultDicts: AnyDict[],
): ConfigValuesTypeSafe<S> => {
  const dictStack: AnyDict[][] = [];
  let dicts = defaultDicts;
  return mapShape(
    shape,
    (type, key) => {
      const dictDefault = getDefaultValue(loaders, dicts, key, type);
      const typeDefault = type.hasOwnProperty('default') ? some(type.default) : none;
      const defaultValue = dictDefault.alt(typeDefault);
      if (defaultValue.isNone()) {
        throw new ConfigError(`missing value for '${key}'`);
      }
      const result = type._.decode(defaultValue.value);
      if (result.isLeft()) {
        throw new ConfigError(
          `decoding value '${key}' failed:${PathReporter.report(result)
            .map(msg => `\n${msg}`)
            .join('')}`,
        );
      }
      return result.value;
    },
    key => {
      dictStack.push(dicts);
      dicts = [];
      for (const dict of dictStack[dictStack.length - 1]) {
        if (t.Dictionary.is(dict[key])) {
          dicts.push(dict[key]);
        }
      }
    },
    () => {
      dicts = dictStack.pop()!;
    },
  );
};

export const getDefaultValue = <T extends t.Any, L extends ConfigTypeLoader>(
  loaders: L[],
  defaultDicts: AnyDict[],
  key: string,
  type: ConfigShapeTypeDescriptor<T>,
): Option<t.TypeOf<T>> => {
  for (const loader of loaders) {
    const result = loader.onType(type);
    if (result.isSome()) {
      return result;
    }
  }
  for (const defaultDict of defaultDicts) {
    if (defaultDict.hasOwnProperty(key)) {
      return some(defaultDict[key]);
    }
  }
  return none;
};
