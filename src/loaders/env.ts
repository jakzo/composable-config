import { some, none } from 'fp-ts/lib/Option';
import { ConfigTypeLoader } from '../types/options';

export default function envLoader(): ConfigTypeLoader {
  return {
    onType(type) {
      return type.env && process.env.hasOwnProperty(type.env) ? some(process.env[type.env]) : none;
    },
  };
}
