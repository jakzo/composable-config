# Composable Config - TypeScript

This library is designed to work beautifully with TypeScript. When you declare the shapes of your config, it will automatically infer the type of the outputted config value object.

However there are a few gotchas which you should be wary of:

🙅‍♀️ **Do not give config shapes explicit types**

```ts
import { ConfigShape, buildConfig } from 'composable-config';
import * as ct from 'composable-config/io';

const configShape: ConfigShape = {
  a: ct.number,
};
const config = buildConfig({
  config: configShape,
  defaults: { a: 1 },
});
console.log(config.x); // TS does not know what properties exist on `config`
```

When you add the `ConfigShape` annotation, it casts the type `{ a: ct.number }` into `ConfigShape`, losing any known properties. If you want to restrict the type of a value to `ConfigShape`, you should use _generics_ with extension:

💁‍♀️ **Do use generics which extend shape types**

```ts
import { ConfigShape, buildConfig } from 'composable-config';
import * as ct from 'composable-config/io';

const requireShape = <S extends ConfigShape>(shape: S): S => shape;
const configShape = requireShape({
  a: ct.number,
});
const config = buildConfig({
  config: configShape,
  defaults: { a: 1 },
});
console.log(config.x); // TS will know this is wrong and cause an error 🎉
```

By using generics you're telling the type system that the type of `configShape` is not `ConfigShape`, but some other type `S` (in this case `{ a: ct.number }`) which is _compatible_ with `ConfigShape`.

Incidentally, this is exactly what `createConfig()` does. It doesn't modify its input at all, it is only used to _validate_ the type of the input.
