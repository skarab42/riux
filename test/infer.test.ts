import { it } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';

import { createStore, InferActions, InferMutations, InferState, MutationFunction } from '../src/index.js';

it('should infer state type', () => {
  const numberStore = createStore(42);
  const stringStore = createStore('life');
  const booleanStore = createStore(true);
  const objectStore = createStore({ life: 42 });

  expectType<InferState<typeof numberStore>>().identicalTo<number>();
  expectType<InferState<typeof stringStore>>().identicalTo<string>();
  expectType<InferState<typeof booleanStore>>().identicalTo<boolean>();
  expectType<InferState<typeof objectStore>>().identicalTo<{ life: number }>();

  expectType<InferMutations<typeof numberStore>>().identicalTo<unknown>();
  expectType<InferActions<typeof numberStore>>().identicalTo<unknown>();
});

it('should infer mutations type', () => {
  const storeWithMutations = createStore(42, {
    mutations: {
      add: (state, value: number) => state + value,
    },
  });

  expectType<InferMutations<typeof storeWithMutations>>().identicalTo<{
    add: (state: number, value: number) => number;
  }>();
});

it('should infer action type', () => {
  const storeWithActions = createStore(42, {
    mutations: {
      add: (state, value: number) => state + value,
    },
    actions: {
      add: (mutation, value: number) => {
        mutation('add', value);
      },
    },
  });

  expectType<InferActions<typeof storeWithActions>>().identicalTo<{
    add: (mutation: MutationFunction<number, { add: (state: number, value: number) => number }>, value: number) => void;
  }>();
});
