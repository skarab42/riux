import { expect, it } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';

import { createStore } from '../src/index.js';

it('should create an immutable store', () => {
  const state = { life: 42 };
  const store = createStore(state);

  expect(store.initial()).toStrictEqual(state);
  expectType(store.initial()).identicalTo<{ readonly life: number }>();

  expect(store.current()).toStrictEqual(state);
  expectType(store.current()).identicalTo<{ readonly life: number }>();

  expect(() => {
    state.life = 24;
  }).toThrow("Cannot assign to read only property 'life' of object");

  expect(store.initial()).toStrictEqual({ life: 42 });
  expect(store.current()).toStrictEqual({ life: 42 });

  expect(() => {
    expectType((store.current().life = 24)).toThrowError(2540);
  }).toThrow("Cannot assign to read only property 'life' of object");
});

it('should create an immutable store without freezing the initial store', () => {
  const state = { life: 42 };
  const store = createStore(state, { freezeInitialState: false });

  expect(store.initial()).toStrictEqual(state);
  expectType(store.initial()).identicalTo<{ life: number }>();

  expect(store.current()).toStrictEqual(state);
  expectType(store.current()).identicalTo<{ readonly life: number }>();

  state.life = 24;

  expect(store.initial()).toStrictEqual({ life: 42 });
  expect(store.current()).toStrictEqual({ life: 42 });
  expectType(store.current()).identicalTo<{ readonly life: number }>();
});
