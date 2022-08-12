import { createAction, createActions } from '../../../src/index.js';
import { initialState, type Item } from './initial-state.js';
import { mutations } from './mutations.js';

const addItems = createAction(initialState, mutations, (mutation, items: Item[]) => {
  for (const item of items) {
    mutation('addItem', item);
  }
});

export const actions = createActions(initialState, mutations, {
  setName(mutation, name: string) {
    mutation('setName', name);
  },
  addItems,
});
