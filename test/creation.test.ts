import { expect, it } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';

import { createStore } from '../src/index.js';
import { Clock, ImmerableClock } from './fixtures/clock.js';

it('should create store from number', () => {
  const value = 42;
  const store = createStore(value);

  expect(store.initial()).toStrictEqual(value);
  expectType(store.initial()).identicalTo<number>();

  expect(store.current()).toStrictEqual(value);
  expectType(store.current()).identicalTo<number>();
});

it('should create store from bigint', () => {
  const value = BigInt(42);
  const store = createStore(value);

  expect(store.initial()).toStrictEqual(value);
  expectType(store.initial()).identicalTo<bigint>();

  expect(store.current()).toStrictEqual(value);
  expectType(store.current()).identicalTo<bigint>();
});

it('should create store from string', () => {
  const value = 'life';
  const store = createStore(value);

  expect(store.initial()).toStrictEqual(value);
  expectType(store.initial()).identicalTo<string>();

  expect(store.current()).toStrictEqual(value);
  expectType(store.current()).identicalTo<string>();
});

it('should create store from boolean', () => {
  const value = true;
  const store = createStore(value);

  expect(store.initial()).toStrictEqual(value);
  expectType(store.initial()).identicalTo<boolean>();

  expect(store.current()).toStrictEqual(value);
  expectType(store.current()).identicalTo<boolean>();
});

it('should create store from number array', () => {
  const value = [1, 2, 3];
  const store = createStore(value);

  expect(store.initial()).toStrictEqual(value);
  expectType(store.initial()).identicalTo<readonly number[]>();

  expect(store.current()).toStrictEqual(value);
  expectType(store.current()).identicalTo<readonly number[]>();
});

it('should create store from string array', () => {
  const value = ['nyan', 'life'];
  const store = createStore(value);

  expect(store.initial()).toStrictEqual(value);
  expectType(store.initial()).identicalTo<readonly string[]>();

  expect(store.current()).toStrictEqual(value);
  expectType(store.current()).identicalTo<readonly string[]>();
});

it('should create store from mixed array', () => {
  const value = ['life', 42, true];
  const store = createStore(value);

  expect(store.initial()).toStrictEqual(value);
  expectType(store.initial()).identicalTo<readonly (string | number | boolean)[]>();

  expect(store.current()).toStrictEqual(value);
  expectType(store.current()).identicalTo<readonly (string | number | boolean)[]>();
});

it('should create store from plain object', () => {
  const value = { life: 42 };
  const store = createStore(value);

  expect(store.initial()).toStrictEqual(value);
  expectType(store.initial()).identicalTo<{ readonly life: number }>();

  expect(store.current()).toStrictEqual(value);
  expectType(store.current()).identicalTo<{ readonly life: number }>();
});

it('should create store from immerable class', () => {
  const clock = new ImmerableClock(0, 42);
  const store = createStore(clock);

  expect(store.initial()).toStrictEqual(clock);
  expectType(store.initial()).subtypeOf<ImmerableClock>();

  expect(store.current()).toStrictEqual(clock);
  expectType(store.current()).subtypeOf<ImmerableClock>();
});

it('should error on no immerable class', () => {
  expect(() => {
    createStore(new Clock(0, 42));
  }).toThrow('[Immer] produce can only be called on things that are draftable');
});

it('should create store without freezing inital state', () => {
  const value = { life: 42 };
  const store = createStore(value, { freezeInitialState: false });

  expect(store.initial()).toStrictEqual(value);
  expectType(store.initial()).identicalTo<{ readonly life: number }>();

  expect(store.current()).toStrictEqual(value);
  expectType(store.current()).identicalTo<{ readonly life: number }>();
});
