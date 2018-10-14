# Composable Config

_Composable app configuration with loading, conversion, validation and type support built-in._

- [API Reference](docs/api.md)
- [IO Types](docs/io.md)
- [Loaders](docs/loaders.md)
- [Common Patterns](docs/patterns.md)
- [TypeScript](docs/typescript.md)

## Quick Start

```sh
npm i composable-config
```

```js
import { createConfig, buildConfig } from 'composable-config';
import * as ct from 'composable-config/io';
import envLoader from 'composable-config/loaders/env';

const dbConfig = createConfig({
  tableName: ct.string,
});

const serverConfig = createConfig({
  host: {
    _: ct.string,
    default: '127.0.0.1',
  },
  port: {
    _: ct.Port,
    default: 8080,
    env: 'SERVER_PORT',
  },
});

const appConfig = createConfig({
  server: serverConfig,
  db: dbConfig,
});

const config = buildConfig({
  config: appConfig,
  loaders: [envLoader()],
  defaults: {
    db: {
      tableName: 'xyz',
    },
  },
});

assert(process.env['SERVER_PORT']).equals('1234');

assert(config).equals({
  db: {
    tableName: 'xyz',
  },
  server: {
    host: '127.0.0.1',
    port: 1234,
  },
});
```
