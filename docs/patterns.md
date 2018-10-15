# Composable Config - Common Patterns

This page illustrates a few examples of how to use Composable Config with particular project setups and requirements.

- [File Structure - Grouped by Domain](#File-Structure---Grouped-by-Domain)

## File Structure - Grouped by Domain

If you group your files by _domain_ like so:

```
src
  users
    config.js
    db.js
    view.js
  books
    config.js
    db.js
    view.js
  ...
```

Then you can compose your config like this:

```js
// src/config.js
import { buildConfig } from 'composable-config';
import usersShape from './users/config-shape';
import booksShape from './books/config-shape';

export default buildConfig({
  config: {
    users: usersShape,
    books: booksShape,
  },
});
```

```js
// src/users/config-shape.js
import * as t from 'io-ts';
import build from '../build-config';

export default build({
  showPerPage: { _: t.number, default: 10 },
});
```

```js
// src/users/config.js
import config from '../config';
export default config.users;
```

```js
// src/users/view.js
import config from './config';

doSomething(config.showPerPage);
```

```js
// src/books/config-shape.js
// etc...
```

**Benefits**

- Config values are stored in their domain folder
- Domain files importing the config do not need to worry about where the config exists within the global app config

**Drawbacks**

- Two config files (shape and values) are required per domain to prevent circular dependecies
