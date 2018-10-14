import { ConfigTypeLoader } from '../types/options';
import { some, none } from 'fp-ts/lib/Option';

const envLoader = (): ConfigTypeLoader => ({
  onType(type) {
    return type.env && process.env.hasOwnProperty(type.env) ? some(process.env[type.env]) : none;
  },
});

export default envLoader;
