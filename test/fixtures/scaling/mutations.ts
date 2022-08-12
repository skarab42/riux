import { createMutation, createMutations } from '../../../src/index.js';
import { initialState, type Item } from './initial-state.js';

const addItem = createMutation(initialState, (draft, item: Item) => {
  draft.items.push(item);
});

export const mutations = createMutations(initialState, {
  setName: (draft, name: string) => {
    draft.name = name;
  },
  setLife(draft, life: number) {
    draft.life = life;
  },
  addItem,
});
