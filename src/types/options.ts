import * as t from 'io-ts';
import { Option } from 'fp-ts/lib/Option';
import { AnyDict } from './util';
import { ConfigShape, ConfigShapeTypeDescriptor } from './shape';

export interface BuildOptions<S extends ConfigShape> {
  /** The shape of the config to build, including any types, validators and default values. */
  config: S;
  /** List of config loaders. These are data sources of the config values. */
  loaders?: ConfigLoader[];
  /** Map of default config values. */
  defaults?: AnyDict;
}

/** A data source for config values. */
export interface ConfigLoader extends Partial<ConfigDefaultsLoader>, Partial<ConfigTypeLoader> {}

export interface ConfigDefaultsLoader {
  /** Returns a map of default values to use when building the config. */
  getDefaults: () => AnyDict;
}

export interface ConfigTypeLoader {
  /**
   * Called for every type descriptor found in the shape when building.
   * @returns An `Option` specifying the value that it should be set to.
   */
  onType: <T extends t.Any>(type: ConfigShapeTypeDescriptor<T>) => Option<t.TypeOf<T>>;
}
