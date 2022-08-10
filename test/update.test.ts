import { expect, it, vi } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';

import type { WritableDraft } from 'immer/dist/internal.js';
import { createStore } from '../src/index.js';

it('should update the store', () => {
  const store = createStore({ counter: 0 });

  const actualValues: number[] = [];
  const expectedValues = [0, 1, 2];
  const collectValue = vi.fn((value: number) => actualValues.push(value));

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const increment = () =>
    store.update((state) => {
      expectType(state).identicalTo<WritableDraft<{ readonly counter: number }>>();
      collectValue(state.counter);
      state.counter++;
    });

  expect(increment().counter).toBe(1);
  expect(increment().counter).toBe(2);

  const currentState = increment();

  expect(() => {
    expectType((currentState.counter = 10_000)).toThrowError(2540);
  }).toThrow("Cannot assign to read only property 'counter' of object");

  expect(currentState).toStrictEqual({ counter: 3 });
  expect(actualValues).toStrictEqual(expectedValues);
  expect(collectValue).toHaveBeenCalledTimes(expectedValues.length);

  expectType(currentState).identicalTo<{ readonly counter: number }>();
});
