import { expect, it } from 'vitest';

import { isObject } from '../src/index.js';

it('should test object', () => {
  // eslint-disable-next-line unicorn/no-null
  expect(isObject(null)).toBe(false);
  expect(isObject(true)).toBe(false);
  expect(isObject(() => 42)).toBe(false);

  expect(isObject({})).toBe(true);
  expect(isObject({ life: 42 })).toBe(true);
});
