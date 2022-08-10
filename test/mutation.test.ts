import { expect, it, vi } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';

import { createStoreWithMutations } from './fixtures/create-store.js';

it('should create store with mutations', () => {
  const store = createStoreWithMutations();

  const actualValues: number[] = [];
  const expectedValues = [43, 44, 45, 55, 75, 76];
  const collectValue = vi.fn((value: number) => actualValues.push(value));

  store.subscribe((value) => {
    expectType(value).identicalTo<number>();
    collectValue(value);
  });

  expect(store.mutation('increment')).toBe(43);
  expect(store.mutation('increment')).toBe(44);
  expect(store.mutation('increment')).toBe(45);

  expect(collectValue).toHaveBeenCalledTimes(3);

  expect(store.mutation('add', 10)).toBe(55);
  expect(store.mutation('add', 20)).toBe(75);

  expect(collectValue).toHaveBeenCalledTimes(5);

  expect(store.mutation('increment')).toBe(76);

  expect(actualValues).toStrictEqual(expectedValues);
  expect(collectValue).toHaveBeenCalledTimes(expectedValues.length);
});

it('should error on missing argument', () => {
  const store = createStoreWithMutations();

  expectType(store.mutation('add')).toThrowError(2554);
});

it('should error on extra argument', () => {
  const store = createStoreWithMutations();

  expectType(store.mutation('add', 10, 42)).toThrowError(2554);
});

it('should error on invalid argument type', () => {
  const store = createStoreWithMutations();

  expectType(store.mutation('add', 'life')).toThrowError(2345);
});
