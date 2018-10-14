import * as t from 'io-ts';
import { AnyDict } from './util';

/**
 * Shape of config values, including value types and options.
 *
 * This is an object where each value is either a type or another shape.
 * Types are `io-ts` types. A type can also be an object where the `_` property is the `io-ts`
 * type and the rest of the properties are options (eg. default values, environment variable name).
 */
export interface ConfigShape {
  [property: string]: ConfigShapeType | ConfigShape;
}
/** Describes the type of a config value. */
export type ConfigShapeType<T extends t.Any = t.Any> = T | ConfigShapeTypeDescriptor<T>;
/** Describes the type of a config value with additional options. */
export interface ConfigShapeTypeDescriptor<T extends t.Any = t.Any> {
  /** `io-ts` type of the value. This handles deserialization and validation. */
  _: T;
  /** Default value to be used if no loader provides one. */
  default?: t.TypeOf<T>;
  /** Other options used by loaders. */
  [option: string]: any;
}

/** The type of the config object which is built from a shape. */
export type ConfigValuesTypeSafe<S extends ConfigShape> = ConfigValues<S>;
// `AnyDict` is used instead of `ConfigShape` because conditional types do not support narrowing
// (the `ConfigValues<S[K]>` line would complain that `S[K]` might not be a `ConfigShape`
// because it could be a `t.Any`, even though we know that it cannot because
// `S[K] extends ConfigShapeType` was not true)
export type ConfigValues<S extends AnyDict> = {
  [K in keyof S]: S[K] extends ConfigShapeType
    ? t.TypeOf<
        S[K] extends t.Any ? S[K] : S[K] extends ConfigShapeTypeDescriptor ? S[K]['_'] : never
      >
    : ConfigValues<S[K]>
};
