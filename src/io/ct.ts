import * as t from 'io-ts';
import { Integer } from './io';

export const Port = t.refinement(Integer, n => n >= 1 && n <= 0xffff, 'Port');
