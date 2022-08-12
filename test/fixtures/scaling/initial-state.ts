export const initialState = {
  name: 'nyan',
  life: 42,
  items: [
    { id: 1, name: 'item-1', rare: true },
    { id: 2, name: 'item-2', rare: false },
    { id: 3, name: 'item-3', rare: false },
  ],
};

export type State = typeof initialState;
export type Item = State['items'][number];
