<div align="center">
  <img src="https://user-images.githubusercontent.com/62928763/184168494-85d90d39-66d1-4f5a-a484-d4ae464e8495.svg" alt="Riux logo" />
</div>

<h1 align="center">
  Riux is a fully typed and <a href="#immutability">immutable</a> store made on top of <a href="https://immerjs.github.io/immer/">Immer</a> with <a href="#add-some-mutations">mutation</a>, <a href="#add-some-actions">action</a>, <a href="#add-some-subscriptions">subscription</a> and <a href="#validation-with-zod-superstruct-yup-tson">validation</a>!
  <br />
</h1>

<br />

<div align="center">
  <a href="https://github.com/skarab42/riux/actions/workflows/test-release.yaml"><img src="https://github.com/skarab42/riux/actions/workflows/test-release.yaml/badge.svg" alt="Test and Lint"></a>
  <a href="https://codecov.io/gh/skarab42/riux"><img src="https://codecov.io/gh/skarab42/riux/branch/main/graph/badge.svg?token=YVUTZ0C1GR"/></a>
  <img src="https://img.shields.io/github/languages/code-size/skarab42/riux?color=success&style=flat" alt="GitHub code size in bytes">
  <img src="https://img.shields.io/github/license/skarab42/riux?color=success" alt="GitHub">
  <a href="https://github.com/sponsors/skarab42"><img src="https://img.shields.io/github/sponsors/skarab42?color=ff69b4&label=%E2%9D%A4%20sponsors%20" alt="GitHub Sponsors"></a>
  <a href="https://www.twitch.tv/skarab42"><img src="https://img.shields.io/twitch/status/skarab42?style=social" alt="Twitch Status"></a>
</div>

<br />
<hr />

<details>
<summary align="center">Table of contents 👀</summary>

- [Installation](#installation)
- [Usage](#usage)
  - [Basic usage](#basic-usage)
  - [Add some mutations](#add-some-mutations)
  - [Add some subscriptions](#add-some-subscriptions)
  - [Add some actions](#add-some-actions)
  - [Immutability](#immutability)
  - [Validation with custom parser](#validation-with-custom-parser)
  - [Validation with Zod, Superstruct, Yup, tson, ...](#validation-with-zod-superstruct-yup-tson-)
- [Scaling](#scaling)
- [Type inference](#type-inference)

</details>

<hr />
<br />

# Installation

```bash
pnpm add riux
```

# Usage

### Basic usage

```ts
import riux from 'riux';

const store = riux(42);

const reset = () => store.update(() => 0);
// 'draft' is automatically typed as 'number'
const increment = () => store.update((draft) => draft + 1);
const add = (value: number) => store.update((draft) => draft + value);

increment(); // 1
increment(); // 2
add(40); // 42
reset(); // 0
```

Ok, that's cool, but that's more or less what [Immer](https://immerjs.github.io/immer/produce#example) already does! What next?

### Add some mutations

This is the same example as above but using mutations.

```ts
const store = riux(42, {
  // 'draft' is automatically typed as 'number' in each mutation
  mutations: {
    reset: () => 0,
    increment: (draft) => draft + 1,
    add: (draft, value: number) => draft + value,
  },
});

store.mutation('increment'); // 1
store.mutation('increment'); // 2
store.mutation('add', 40); // 42
store.mutation('reset'); // 0
```

As you can see the code is a bit longer but better structured. All is centralized in the store (which allows for example to have autocompletions in the IDE). But this is not the only advantage and you will see it later with the [actions](#add-some-actions).

Ok nice... But what next?

### Add some subscriptions

You can register a function that will be called when the state is updated.

> An update is raised each time the `update`, `mutation` or `action` function is called.

```ts
const store = riux({ counter: 0 });

// 'state' is automatically typed as '{ counter: number }'
const subscription = store.subscribe((state) => {
  console.log(state.counter);
});
```

```ts
subscription.disable(); // unsubscribe
subscription.enable(); // resubscribe
```

Well, that's a minimum, isn't it? What else is there?

### Add some actions

The actions allow you to compose mutations that do not raise an event before the end of the action.

```ts
const store = riux(42, {
  // 'draft' is automatically typed as 'number' in each mutation
  mutations: {
    reset: () => 0,
    increment: (draft) => draft + 1,
    add: (draft, value: number) => draft + value,
  },
  // 'mutation' is automatically typed in each action
  actions: {
    incrementTwice(mutation) {
      mutation('increment');
      mutation('increment');
    },
    addArray(mutation, values: number[]) {
      for (const value of values) {
        mutation('add', value);
      }
    },
  },
});

store.subscribe((counter) => {
  console.log(counter);
});

store.mutation('reset'); // 0

store.action('incrementTwice'); // 2
store.action('incrementTwice'); // 4
store.action('addArray', [5, 8, 10, 15]); // 42

// 'console.log' is called 4 times!
```

> If an error is raised in an action, it will not be finalised and the state will remain unchanged, even if any mutations have been successfully completed.

Incredible, but I think I've seen this before! You talk about immutability at the beginning, and you haven't even mentioned it yet... say more!

### Immutability

By default when you create a store, it becomes immutable as well as its source (as far as possible). This behaviour can be changed for the source but not for the state. In short, once created you will not be able to modify the state or any of is properties outside of the store!

```ts
const source = { life: 42 };
const store = riux(source);

source.life = 1337; // RUNTIME ERROR: Cannot assign to read only property 'life' of object...

const initialState = store.initial();
const currentState = store.current();

initialState.life = 1337; // TS ERROR + RUNTIME ERROR: Cannot assign to 'life' because it is a read-only property.
currentState.life = 1337; // TS ERROR + RUNTIME ERROR: Cannot assign to 'life' because it is a read-only property.
```

If you wish to avoid the first error you can set the `freezeInitialState` option to `false`.

> Note that the state retrieved via `store.initial()` remains unchanged and immutable. Only the source outside the store will not be frozen.

```ts
const store = riux(source, { freezeInitialState: false });

source.life = 1337; // NO ERROR!
// ...
initialState.life = 1337; // TS ERROR + RUNTIME ERROR: Cannot assign to 'life' because it is a read-only property.
currentState.life = 1337; // TS ERROR + RUNTIME ERROR: Cannot assign to 'life' because it is a read-only property.
```

Ok that rocks, one source of truth I like that! But I want more!

### Validation with custom parser

By default no data validation is done at runtime, only TypeScript protects you from input type errors at build time or in the IDE.

If you want to validate your data at runtime, you must provide a `parse` function that validates/casts the state before finalizing the draft and either returns a strongly typed value (if valid) or throws an error (if invalid).

```ts
const store = riux(0, {
  parse: (state) => {
    if (typeof state === 'number') return state;
    throw new Error(`expected 'number' got '${typeof state}'`);
  },
  mutations: {
    add(draft, value: number) {
      return draft + value;
    },
  },
});

store.mutation('add', 'prout'); // TS ERROR + RUNTIME ERROR: expected 'number' got 'string'
```

Another advantage of this method is the ability to specify multiple types (union). Imagine you have a single value that can be undefined or a string. How do you do this?

```ts
const store = riux(undefined, {
  parse: (state) => {
    if (state === undefined || typeof state === 'string') return state;
    throw new Error(`expected 'number' got '${typeof state}'`);
  },
  mutations: {
    set(_draft, value: string | undefined) {
      return value;
    },
  },
});

store.current(); // string | undefined

store.mutation('set', undefined);
store.mutation('set', 'or string');
store.mutation('set', 42); // TS ERROR + RUNTIME ERROR: expected 'string' got 'number'
```

This is starting to be very interesting, but I'm sure we can do better! Right?

### Validation with Zod, Superstruct, Yup, tson, ...

[Zod](https://github.com/colinhacks/zod) is a TypeScript-first schema validation with static type inference which can be used to validate the state of the store on each mutation. This is very powerful when it comes to parse complex data structures.

```ts
const schema = z.object({
  name: z.string().min(3),
  life: z.number(),
});

const store = riux(
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

store.current(); // { readonly name: string; readonly life: number }

store.mutation('setName', 'bob'); // { name: 'bob', life: 42 }
store.mutation('setLife', 1337); // { name: 'bob', life: 1337 }

store.mutation('setLife', [true]); // TS ERROR + RUNTIME ZodError: Expected number, received array
store.mutation('setName', 'na'); // TS ERROR + RUNTIME ZodError: String must contain at least 3 character(s)
```

> The Example above is with [Zod](https://github.com/colinhacks/zod), but it can work with any library that exposes a function/method with the right signature, like [Superstruct](https://github.com/ianstormtaylor/superstruct), [Yup](https://github.com/jquense/yup), [tson](https://github.com/skarab42/tson) and more...

Need more?

# Scaling

As your store grows you will probably want to split your code into several files. Here's how to do it.

```ts
// initial-state.ts

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
```

```ts
// mutations.ts

import { createMutation, createMutations } from 'riux';
import { initialState, type Item } from './initial-state.js';

// This function could be in another file, for example 'mutations/add-item.ts.
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
```

```ts
// actions/add-items.ts

import { createAction } from 'riux';
import { initialState, type Item } from '../initial-state.js';
import { mutations } from '../mutations.js';

export const addItems = createAction(initialState, mutations, (mutation, items: Item[]) => {
  for (const item of items) {
    mutation('addItem', item);
  }
});
```

```ts
// actions.ts

import { createAction, createActions } from 'riux';
import { initialState, type Item } from './initial-state.js';
import { mutations } from './mutations.js';
import { addItems } from './actions/add-items.js';

export const actions = createActions(initialState, mutations, {
  setName(mutation, name: string) {
    mutation('setName', name);
  },
  addItems,
});
```

```ts
// store.ts
import { initialState, type Item } from './initial-state.js';
import { mutations } from './mutations.js';
import { actions } from './actions.js';

export const store = createStore(initialState, { mutations, actions });
```

# Type inference

You can extract the TypeScript types of any store with `InferState`, `InferMutations` or `InferActions`.

```ts
import riux, { type InferState, type InferMutations } from 'riux';

const store = riux(42, {
  mutations: {
    add: (state, value: number) => state + value,
  },
});

type State = InferState<typeof store>; // number
type Mutations = InferMutations<typeof store>; // { add: (state: number, value: number) => number; }
```

Ok that's all for now, but if you think something is missing you can open an [issue](https://github.com/skarab42/riux/issues) or even better make a [pull request](https://github.com/skarab42/riux/pulls).

---

Scaffolded with [@skarab/skaffold](https://www.npmjs.com/package/@skarab/skaffold)
