# Composable Config - Common Patterns

This page illustrates a few examples of how to use Composable Config with particular project setups and requirements.

- [Extra Validation](#Extra-Validation)
- [File Structure - Grouped by Domain](#File-Structure---Grouped-by-Domain)

## Extra Validation

Sometimes you have extra requirements you want to assert for your config values. As an example, here is how you would ensure a particular value was an even number:

```js
import { createConfig } from 'composable-config';
import * as ct from 'composable-config/io';
const shape = createConfig({
  address: ct.refinement(ct.Integer, n => n % 2 === 0),
});
```

This will throw an exception if it does not receive an even integer. If instead you wanted to round odd numbers down to an even number, you could do this:

```js
import { createConfig, addConvertor } from 'composable-config';
import * as ct from 'composable-config/io';
const shape = createConfig({
  address: addConvertor(ct.Integer, m => {
    if (typeof m === 'number' && m % 2 === 1) return success(m - 1);
    return ct.success(m);
  }),
});
```

Note that `m` may not necessarily be a number. If it is coming from an environment variable, for example, it will be a string. Once this callback has completed, the returned value will be passed into `ct.Integer`'s convertor which will convert it into an integer.

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
