# Composable Config - Loaders

Loaders _load_ the values of your config. They can either provide a map of default values (eg. a loader might read a JSON file containing your saved configuration values) or provide a value for each config value individually based on its properties (eg. a loader might check for an `env` property on each config value type which has the environment variable name containing its value).

See [src/loaders](../src/loaders) for the list of built-in loaders.

You can also build your own loaders.
