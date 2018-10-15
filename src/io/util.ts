import * as t from 'io-ts';

/**
 * Adds type conversion capability to an existing io-ts type.
 * @returns `t.success(convertedValue)` or `t.failure(originalValue, c)` on failure.
 */
export const conversion = <T extends t.Any>(
  type: T,
  convert: (m: t.mixed, c: t.Context) => t.Validation<t.TypeOf<T>>,
  name: string = type.name,
): T =>
  // TODO: It's probably less hacky and not much harder to wrap it in a new type...
  Object.assign(Object.create(Object.getPrototypeOf(type)), type, {
    name,
    validate(m: t.mixed, c: t.Context) {
      const converted = convert(m, c);
      if (converted.isLeft()) return converted;
      return type.validate.call(this, converted.value, c);
    },
  });
