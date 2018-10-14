import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';

export class ConfigType<S, A = ConfigValues<S>, O = A, I = t.mixed> extends t.Type<A, O, I> {
  readonly _tag: 'ConfigType' = 'ConfigType';
  constructor(
    name: string,
    is: ConfigType<S, A, O, I>['is'],
    validate: ConfigType<S, A, O, I>['validate'],
    encode: ConfigType<S, A, O, I>['encode'],
    readonly shape: S,
  ) {
    super(name, is, validate, encode);
  }
}

export interface ConfigShape {
  [property: string]: ConfigShape | ConfigShapeValue;
}

/** Only use this type if you have previously type-checked the value to be a `ConfigShape`. */
export interface ConfigShapeAny {
  [property: string]: any;
}

export interface ConfigShapeValueDescriptor {
  _: t.Any;
  default?: any;
  [loaderOption: string]: any;
}

export type ConfigShapeValue = t.Any | ConfigShapeValueDescriptor;

export interface ConfigDefaultValues {
  [key: string]: any;
}

export type ConfigValues<S extends ConfigShapeAny> = {
  [K in keyof S]: S[K] extends ConfigShapeValue
    ? t.TypeOf<
        S[K] extends t.Any ? S[K] : S[K] extends ConfigShapeValueDescriptor ? S[K]['_'] : never
      >
    : ConfigValues<S[K]>
};
export type ConfigSerialized<S extends ConfigShapeAny> = {
  [K in keyof S]: S[K] extends t.Any ? t.OutputOf<S[K]> : ConfigSerialized<S[K]>
};

export type MergeShapes<A extends ConfigShapeAny, B extends ConfigShapeAny> = {
  [K in keyof (A & B)]: K extends keyof B
    ? K extends keyof A
      ? B[K] extends ConfigShapeValue
        ? B[K]
        : A[K] extends ConfigShapeValue ? B[K] : MergeShapes<A[K], B[K]>
      : B[K]
    : K extends keyof A ? A[K] : never
};

export type MergeDefaultValues<A extends ConfigDefaultValues, B extends ConfigDefaultValues> = {
  [K in Exclude<keyof A, keyof B>]: A[K]
} &
  B;

/**
 * Returns a new config shape which is two merged together.
 * If the shapes have conflicting types an exception will be thrown.
 */
export const mergeShapes = <A extends ConfigShape, B extends ConfigShape>(a: A, b: B): A & B => {
  const output: A & B = { ...(a as any) };
  for (const [key, valB] of Object.entries(b)) {
    if (!a.hasOwnProperty(key)) {
      output[key] = valB;
    } else {
      const valA = a[key];
      if (valA instanceof t.Type || valB instanceof t.Type) {
        throw new Error('Overlapping types found when merging config shapes');
      }
      output[key] = mergeShapes(valA, valB);
    }
  }
  return output;
};

/**
 * Returns a new object which is two objects deep-merged together.
 * Values from `b` overwrite existing ones from `a`.
 */
export const mergeValues = <A extends ConfigDefaultValues, B extends ConfigDefaultValues>(
  a: A,
  b: B,
): MergeDefaultValues<A, B> => {
  const output: MergeDefaultValues<A, Partial<B>> = { ...(a as any) };
  for (const [key, valB] of Object.entries(b)) {
    if (!a.hasOwnProperty(key)) {
      output[key] = valB;
    } else {
      const valA = a[key];
      if (typeof valA === 'object' && valA !== null) {
        output[key] = mergeValues(valA, valB);
      } else {
        output[key] = valB;
      }
    }
  }
  return output as MergeDefaultValues<A, B>;
};

/** Returns `true` iff `input` matches `shape` (inexact). */
export const isConfigShape = <S extends ConfigShape>(
  shape: S,
  input: t.mixed,
): input is ConfigValues<S> => {
  if (!t.Dictionary.is(input)) return false;
  for (const [key, value] of Object.entries(shape)) {
    // TODO: Check for config annotations (eg. env name)
    if (value instanceof t.Type ? !value.is(input[key]) : !isConfigShape(value, input)) {
      return false;
    }
  }
  return true;
};

/**
 * Deserialize and validate raw config values.
 *
 * @param input Raw config values.
 *
 * Eg. This could be an object of default values merged with environment variables.
 * Environment variable strings which are supposed to be numbers according to the shape (eg. port)
 * will be converted to numbers here.
 */
export const validateConfig = <S extends ConfigShape, I extends t.mixed, A extends ConfigValues<S>>(
  shape: S,
  input: I,
  ctx: t.Context,
): t.Validation<A> => {
  // Make sure input is a dictionary
  const dictValidation = t.Dictionary.validate(input, ctx);
  if (dictValidation.isLeft()) {
    return t.failures(dictValidation.value);
  }
  const inputDict = dictValidation.value;

  const output: Partial<A> = {};
  const errors: t.Errors = [];
  for (const [key, value] of Object.entries(shape)) {
    const result =
      // TODO: Check for config annotations (eg. env name)
      // TODO: Convert env strings to port numbers, etc.
      value instanceof t.Type
        ? value.validate(inputDict[key], ctx)
        : validateConfig(value, inputDict[key], ctx);
    if (result.isLeft()) {
      errors.push(...result.value);
    } else {
      output[key] = result.value;
    }
  }
  return errors.length > 0 ? t.failures(errors) : t.success(output as A);
};

/** Serializes current config values into a `JSON.stringify()`-able object. */
export const serializeConfig = <
  S extends ConfigShape,
  A extends ConfigValues<S>,
  O extends ConfigSerialized<S>
>(
  shape: S,
  config: A,
): O => {
  const output: Partial<O> = {};
  for (const [key, value] of Object.entries(shape)) {
    output[key] =
      value instanceof t.Type
        ? value.encode(config[key])
        : serializeConfig(value, config[key] as ConfigValues<typeof value>);
  }
  return output as O;
};

export const createConfigType = <S extends ConfigShape>(shape: S, name: string = 'Config') =>
  new ConfigType<S, ConfigValues<S>, ConfigSerialized<S>, t.mixed>(
    name,
    (m): m is ConfigValues<S> => isConfigShape(shape, m),
    (input, ctx) => validateConfig(shape, input, ctx),
    config => serializeConfig(shape, config),
    shape,
  );

export class Config<S extends ConfigShape, D extends ConfigDefaultValues> {
  constructor(public readonly shape: S) {}

  concat<T extends ConfigShape, E extends ConfigDefaultValues>(nextConfig: Config<T, E>) {
    return new Config<S & T, MergeDefaultValues<D, E>>(
      mergeShapes(this.shape, nextConfig.shape),
      mergeValues(this.defaults, nextConfig.defaults),
    );
  }

  build(loaders: ConfigLoader[]): ConfigValues<S> {
    let value: ConfigDefaultValues;
    try {
      value = loaders.reduce((prevValue, loader) => loader(prevValue), this.defaults);
    } catch (error) {
      error.message = `Config loader error:\n${error.message}`;
      throw error;
    }

    const type = createConfigType(this.shape);
    const result = type.decode(value);
    if (result.isLeft()) {
      throw new Error(
        `Config validation error:${PathReporter.report(result)
          .map(msg => `\n${msg}`)
          .join('')}`,
      );
    }
    return result.value;
  }
}

export const baseConfig = new Config({}, {});

export interface ConfigLoader {
  (currentValue: ConfigDefaultValues): ConfigDefaultValues;
}

// This is a little bit hacky, but allows me to have a nice API where the shape, types and loader
// aliases are all declared together without having to fork `io-ts` and make many modifications.
declare module 'io-ts' {
  export interface Type<A, O, I> {
    alias: <T>(this: T, name: string) => T;
    aliases?: { [name: string]: any };
  }
}

// TODO: T should extend `Type`
export const cloneTypeWithAlias = <T extends any>(type: T, alias: string): T =>
  Object.assign(Object.create(Object.getPrototypeOf(type)), type, {
    aliases: (type.aliases || []).concat(alias),
  });

t.Type.prototype.alias = function(name) {
  return cloneTypeWithAlias(this, name);
};

export const envLoader = <T>(): ConfigLoader<T> => shape => ({});

// Example usage
const serverConfig = new Config({
  port: t.refinement(t.Integer, n => n >= 1 && n <= 0xffff).alias('PORT'),
  host: t.string.alias('HOST'),
});
serverConfig.build([envLoader()]);
