import { expect, it, vi } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';

import { createStore, Subscription } from '../src/index.js';

it('should subscribe/unsubscribe from store update', () => {
  const state = { counter: 0 };
  const store = createStore(state);

  const actualValues: number[] = [];
  const expectedValues = [1, 6, 7, 10, 11];
  const collectValue = vi.fn((value: number) => actualValues.push(value));

  const subscription = store.subscribe((state) => {
    collectValue(state.counter);
  });

  expectType(subscription).identicalTo<Subscription>();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const increment = () =>
    store.update((state) => {
      state.counter++;
    });

  expect(increment().counter).toBe(1);
  expect(collectValue).toHaveBeenCalledTimes(1);

  const offResult = subscription.disable();
  expect(offResult).toBe(true);

  expectType(offResult).identicalTo<boolean>();

  const offResult2 = subscription.disable();
  expect(offResult2).toBe(false); // disabled twice

  expect(increment().counter).toBe(2);
  expect(increment().counter).toBe(3);
  expect(increment().counter).toBe(4);
  expect(increment().counter).toBe(5);
  expect(collectValue).toHaveBeenCalledTimes(1);

  subscription.enable();

  expect(increment().counter).toBe(6);
  expect(increment().counter).toBe(7);
  expect(collectValue).toHaveBeenCalledTimes(3);

  subscription.disable();

  expect(increment().counter).toBe(8);
  expect(increment().counter).toBe(9);
  expect(collectValue).toHaveBeenCalledTimes(3);

  subscription.enable();

  expect(increment().counter).toBe(10);
  expect(increment().counter).toBe(11);

  expect(actualValues).toStrictEqual(expectedValues);
  expect(collectValue).toHaveBeenCalledTimes(expectedValues.length);
});
