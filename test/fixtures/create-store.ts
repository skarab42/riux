import { createStore } from '../../src/index.js';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createStoreWithActions() {
  return createStore(42, {
    mutations: {
      increment(draft): number {
        return draft + 1;
      },
      add(draft, value: number): number {
        return draft + value;
      },
    },
    actions: {
      incrementTwice(mutation): void {
        mutation('increment');
        mutation('increment');
      },
      addArray(mutation, values: number[]): void {
        for (const value of values) {
          mutation('add', value);
        }
      },
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createStoreWithMutations() {
  return createStore(42, {
    mutations: {
      increment(draft): number {
        return draft + 1;
      },
      add(draft, value: number): number {
        return draft + value;
      },
    },
  });
}
