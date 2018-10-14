import { ConfigShape, ConfigValuesTypeSafe } from './types/shape';
import { BuildOptions } from './types/options';
import { build } from './build';
import { isConfigTypeLoader } from './util';

/**
 * Defines the shape of some config including types, default values and other options.
 *
 * It simply returns the input object as-is. It's purpose is to provide type-checking to verify
 * that the input is indeed a valid shape and visually display that the object is a config shape.
 */
export const createConfig = <S extends ConfigShape>(shape: S): S => shape;

/** Builds the map of config values based on a shape, some config loaders and default values. */
export const buildConfig = <S extends ConfigShape>({
  config,
  loaders = [],
  defaults = {},
}: BuildOptions<S>): ConfigValuesTypeSafe<S> => {
  const defaultDicts = loaders.map(loader => (loader.getDefaults ? loader.getDefaults() : {}));
  defaultDicts.push(defaults);
  return build(config, loaders.filter(isConfigTypeLoader), defaultDicts);
};

export * from './types/options';
export * from './types/shape';
