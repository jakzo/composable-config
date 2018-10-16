import * as t from 'io-ts';
import isIp from 'is-ip';
import { Integer, string } from './io';
import { conversion } from './util';

/* tslint:disable:variable-name */

/**
 * Accepts an integer in the form of a number or string between 1 and 65535 inclusive.
 * Returns a number.
 */
export const Port = t.refinement(Integer, n => n >= 1 && n <= 0xffff, 'Port');

/**
 * Accepts a valid IP4/6 IP address string.
 * Returns the IP address string.
 */
export const IpAddress = t.refinement(string, isIp, 'IpAddress');

/**
 * Accepts a JSON string or a JSON value (null, boolean, number, string, array, object).
 * Returns a JSON value.
 */
export const Json = conversion(
  t.union([t.null, t.number, t.boolean, t.string, t.object], 'Json'),
  (m, c) => {
    if (typeof m === 'string') {
      try {
        return t.success(JSON.parse(m));
      } catch (err) {
        return t.failure(err, c);
      }
    }
    return t.success(m);
  },
);
