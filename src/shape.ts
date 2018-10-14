import * as t from 'io-ts';
import { ConfigShape, ConfigShapeTypeDescriptor, ConfigValuesTypeSafe } from './types/shape';
import { AnyDict } from './types/util';
import { ConfigError } from './util';

/**
 * Maps a config shape to a values object of the same shape.
 * @param onType Called for each type in the shape. The returned value will be mapped.
 * @param onEntry Called when entering a nested shape.
 * @param onExit Called when exiting a nested shape.
 */
export const mapShape = <S extends ConfigShape>(
  shape: S,
  onType: <T extends t.Any>(type: ConfigShapeTypeDescriptor<T>, key: string) => t.TypeOf<T>,
  onEntry: (key: string) => void = () => {},
  onExit: () => void = () => {},
): ConfigValuesTypeSafe<S> => {
  const values: Partial<ConfigValuesTypeSafe<S>> = {};
  for (const key of Object.keys(shape)) {
    const value = shape[key];
    if (value instanceof t.Type) {
      const descriptor = { _: value };
      values[key] = onType(descriptor, key);
    } else if (t.Dictionary.is(value)) {
      if (isConfigTypeDescriptor(value)) {
        values[key] = onType(value, key);
      } else {
        onEntry(key);
        // TODO: Why is this cast needed?
        values[key] = mapShape(value, onType, onEntry, onExit) as any;
        onExit();
      }
    } else {
      throw new ConfigError(`invalid property '${key}' in config shape`);
    }
  }
  return values as ConfigValuesTypeSafe<S>;
};

export const isConfigTypeDescriptor = <T extends t.Any>(
  value: AnyDict,
): value is ConfigShapeTypeDescriptor<T> => value.hasOwnProperty('_');
