import { expect, it } from 'vitest';
import { initialState, type State } from './fixtures/scaling/initial-state.js';

import { createStore } from '../src/index.js';
import type { Immutable } from 'immer';

import { mutations } from './fixtures/scaling/mutations.js';
import { actions } from './fixtures/scaling/actions.js';
import { expectType } from 'vite-plugin-vitest-typescript-assert/tssert';

it('should create store from imported mutation and actions', () => {
  const store = createStore(initialState, { mutations, actions });

  expectType(store.current()).identicalTo<Immutable<State>>();

  store.mutation('setName', 'prout-1');
  store.mutation('addItem', { id: 42, name: 'secret-of-life', rare: true });
  expect(store.current()).toMatchInlineSnapshot(`
    {
      "items": [
        {
          "id": 1,
          "name": "item-1",
          "rare": true,
        },
        {
          "id": 2,
          "name": "item-2",
          "rare": false,
        },
        {
          "id": 3,
          "name": "item-3",
          "rare": false,
        },
        {
          "id": 42,
          "name": "secret-of-life",
          "rare": true,
        },
      ],
      "life": 42,
      "name": "prout-1",
    }
  `);

  expectType(store.current()).identicalTo<Immutable<State>>();

  store.action('setName', 'prout-2');
  store.action('addItems', [{ id: 42, name: 'secret-of-life', rare: true }]);

  expect(store.current()).toMatchInlineSnapshot(`
    {
      "items": [
        {
          "id": 1,
          "name": "item-1",
          "rare": true,
        },
        {
          "id": 2,
          "name": "item-2",
          "rare": false,
        },
        {
          "id": 3,
          "name": "item-3",
          "rare": false,
        },
        {
          "id": 42,
          "name": "secret-of-life",
          "rare": true,
        },
        {
          "id": 42,
          "name": "secret-of-life",
          "rare": true,
        },
      ],
      "life": 42,
      "name": "prout-2",
    }
  `);

  expectType(store.current()).identicalTo<Immutable<State>>();
});
