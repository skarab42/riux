import { createStore } from '../../src/index.js';
import { parseStringOrNumber } from './util.js';

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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createStoreWithValidation() {
  return createStore(0, {
    parse: parseStringOrNumber,
    mutations: {
      increment(draft) {
        return Number(draft) + 1;
      },
      add(draft, value: string | number) {
        return Number(draft) + Number(value);
      },
      set(_draft, value: string | number) {
        return value;
      },
    },
    actions: {
      addArray(mutation, values: unknown[]): void {
        for (const value of values) {
          mutation('add', value as string); // <- deliberate error
        }
      },
    },
  });
}
