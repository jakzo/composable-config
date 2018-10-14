import { ConfigLoader, ConfigTypeLoader } from './types/options';

export class ConfigError extends Error {
  /* istanbul ignore next */
  constructor(public message: string) {
    super(message);
  }
}

export const isConfigTypeLoader = (loader: ConfigLoader): loader is ConfigTypeLoader =>
  !!loader.onType;
