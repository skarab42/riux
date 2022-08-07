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

it('should update the store', () => {
  const state = { counter: 0 };
  const store = createStore(state);

  expect(store.current()).toStrictEqual(state);

  const increment = (): { readonly counter: number } =>
    store.update((state) => {
      state.counter++;
    });

  expect(increment().counter).toBe(1);
  expect(increment().counter).toBe(2);
  expect(increment().counter).toBe(3);
});

it('should subscribe/unsubscribe from store update', () => {
  const state = { counter: 0 };
  const store = createStore(state);

  expect(store.current()).toStrictEqual(state);

  let counter = 0;

  const subscription = store.subscribe((state) => {
    counter = state.counter;
  });

  const increment = (): { readonly counter: number } =>
    store.update((state) => {
      state.counter++;
    });

  expect(increment().counter).toBe(1);
  expect(counter).toBe(1);

  subscription.off();

  expect(increment().counter).toBe(2);
  expect(increment().counter).toBe(3);
  expect(increment().counter).toBe(4);
  expect(increment().counter).toBe(5);

  expect(counter).toBe(1);

  subscription.on();

  expect(increment().counter).toBe(6);
  expect(increment().counter).toBe(7);

  expect(counter).toBe(7);

  subscription.off();

  expect(increment().counter).toBe(8);
  expect(increment().counter).toBe(9);

  expect(counter).toBe(7);

  subscription.on();

  expect(increment().counter).toBe(10);
  expect(increment().counter).toBe(11);

  expect(counter).toBe(11);
});
