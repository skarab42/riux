import { expect, it, vi } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';

import { createStoreWithActions } from './fixtures/create-store.js';

it('should create store with actions', () => {
  const store = createStoreWithActions();

  const actualValues: number[] = [];
  const expectedValues = [44, 46, 48, 190, 191, 192, 1200];
  const collectValue = vi.fn((value: number) => actualValues.push(value));

  store.subscribe((value) => {
    collectValue(value);
  });

  expect(store.action('incrementTwice')).toBe(44);
  expect(store.action('incrementTwice')).toBe(46);
  expect(store.action('incrementTwice')).toBe(48);

  expect(store.action('addArray', [2, 40, 100])).toBe(190);

  expect(store.mutation('increment')).toBe(191);
  expect(store.mutation('increment')).toBe(192);

  expect(store.action('addArray', [1, 2, 3, 1102, -80, -20])).toBe(1200);

  expect(actualValues).toStrictEqual(expectedValues);
  expect(collectValue).toHaveBeenCalledTimes(expectedValues.length);
});

it('should error on missing argument', () => {
  const store = createStoreWithActions();

  expect(() => {
    expectType(store.action('addArray')).toThrowError(2554);
  }).toThrow('values is not iterable');
});

it('should error on extra argument', () => {
  const store = createStoreWithActions();

  expectType(store.action('addArray', [2, 40, 100], 142)).toThrowError(2554);
});

it('should error on invalid argument type', () => {
  const store = createStoreWithActions();

  expectType(store.action('addArray', 'life')).toThrowError(2345);
});
