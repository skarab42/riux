import { expect, it } from 'vitest';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';

import { createStore } from '../src/index.js';
import { parseStringOrNumber } from './fixtures/util.js';
import { createStoreWithValidation } from './fixtures/create-store.js';

import { z } from 'zod';

it('should error if parse option is not a function', () => {
  expect(() => {
    expectType(createStore(0, { parse: 'prout' })).toThrowError(2322);
  }).toThrow(`'options.parse' should be a function got 'string'`);
});

it('should error if initial state does not match parse option', () => {
  expect(() => {
    expectType(createStore(true, { parse: parseStringOrNumber })).toThrowError(2322);
  }).toThrow(`expected 'string|number' got 'boolean'`);
});

it('should validate store update', () => {
  const store = createStore(0, { parse: parseStringOrNumber });

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const set = (value: string | number) => store.update(() => value);

  expect(set(42)).toBe(42);
  expect(set('nyan')).toBe('nyan');

  expect(() => {
    expectType(set(BigInt(42))).toThrowError(2345);
  }).toThrow(`expected 'string|number' got 'bigint'`);

  expect(store.current()).toBe('nyan');
});

it('should validate store mutation', () => {
  const store = createStoreWithValidation();

  const result1 = store.mutation('add', 2);
  expectType(result1).identicalTo<string | number>();

  store.mutation('add', '40');

  expect(store.current()).toBe(42);

  store.mutation('set', 'nyan');

  expect(store.current()).toBe('nyan');

  expect(() => {
    expectType(store.mutation('set', true)).toThrowError(2345);
  }).toThrow(`expected 'string|number' got 'boolean'`);

  expect(store.current()).toBe('nyan');
});

it('should validate store action', () => {
  const store = createStoreWithValidation();

  store.mutation('set', 1334);
  expect(store.current()).toBe(1334);

  store.action('addArray', [1, 1, 1]);
  expect(store.current()).toBe(1337);

  expect(() => {
    store.action('addArray', [1, 1, 1, undefined]);
  }).toThrow(`expected 'string|number' got 'NaN'`);

  expect(store.current()).toBe(1337);
});

it('should validate store with Zod', () => {
  const schema = z.object({
    name: z.string().min(3),
    life: z.number(),
  });

  const store = createStore(
    { name: 'nyan', life: 42 },
    {
      parse: (state) => schema.parse(state),
      mutations: {
        setName(draft, name: string) {
          draft.name = name;
        },
        setLife(draft, life: number) {
          draft.life = life;
        },
      },
    },
  );

  expectType(store.current()).identicalTo<{ readonly name: string; readonly life: number }>();

  expect(store.mutation('setName', 'bob')).toStrictEqual({ name: 'bob', life: 42 });
  expect(store.mutation('setLife', 1337)).toStrictEqual({ name: 'bob', life: 1337 });

  expect(() => {
    expectType(store.mutation('setLife', [true])).toThrowError(2345);
  }).toThrow(`Expected number, received array`);

  expect(() => {
    store.mutation('setName', 'na');
  }).toThrow(`String must contain at least 3 character(s)`);
});
