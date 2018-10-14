# Composable Config - IO Types

See [src/io/io.ts](../src/io/io.ts) for details on `io-ts` types which have been extended to include deserialization.

See [src/io/ct.ts](../src/io/ct.ts) for details on common types which are useful for app configs.

Import and use them like:

```js
import { createConfig } from 'composable-config';
import * as ct from 'composable-config/io';

const configShape = createConfig({
  height: ct.number, // io-ts `number` type but can convert strings to numbers
  port: ct.Port, // custom integer type which must be between 1 and 65535
});
```

You can also build your own types.
