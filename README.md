# @skarab/store

📦 Fully typed and [immutable](#immutability) store made on top of [Immer](https://immerjs.github.io/immer/) with [mutation](#add-some-mutations), [action](#add-some-actions), [subscription](#add-some-subscriptions) and more!

## Installation

```bash
pnpm add @skarab/store
```

## Usage

### Basic usage

```ts
import { createStore } from '@skarab/store';

const store = createStore(42);

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
const store = createStore(42, {
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

As you can see the code is a bit longer but better structured. All is centralized in the store (which allows for example to have autocompletions in the IDE). But this is not the only advantage and you will see it later with the [actions](#add-some-actions). Ok nice... But what next?

### Add some subscriptions

You can register a function that will be called when the state is updated.

> An update is raised each time the `update`, `mutation` or `action` function is called.

```ts
const store = createStore({ counter: 0 });

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
const store = createStore(42, {
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

store.action('reset'); // 0
store.action('incrementTwice'); // 2
store.action('incrementTwice'); // 4
store.action('addArray', [5, 8, 10, 15]); // 42

// 'console.log' is called 4 times!
```

Incredible, but I think I've seen this before! You talk about immutability at the beginning, and you haven't even mentioned it yet... say more!

### Immutability

By default when you create a store, it becomes immutable as well as its source (as far as possible). This behaviour can be changed for the source but not for the state. In short, once created you will not be able to modify the state or any of is properties outside of the store!

```ts
const source = { life: 42 };
const store = createStore(source);

source.life = 1337; // RUNTIME ERROR: Cannot assign to read only property 'life' of object...

const initialState = store.initial();
const currentState = store.current();

initialState.life = 1337; // TS ERROR + RUNTIME ERROR: Cannot assign to 'life' because it is a read-only property.
currentState.life = 1337; // TS ERROR + RUNTIME ERROR: Cannot assign to 'life' because it is a read-only property.
```

If you wish to avoid the first error you can set the `freezeInitialState` option to `false`.

> Note that the state retrieved via `store.initial()` remains unchanged and immutable. Only the source outside the store will not be frozen.

```ts
const store = createStore(source, { freezeInitialState: false });

source.life = 1337; // NO ERROR!
// ...
initialState.life = 1337; // TS ERROR + RUNTIME ERROR: Cannot assign to 'life' because it is a read-only property.
currentState.life = 1337; // TS ERROR + RUNTIME ERROR: Cannot assign to 'life' because it is a read-only property.
```

Ok that rocks, one source of truth I like that! But I want more!

### Validation

WIP...

### Get initial and current state

```ts
store.initial(); // 42
store.current(); // 42

store.mutation('reset'); // 0
store.mutation('increment'); // 1

store.initial(); // 42
store.current(); // 1
```

### Fully typed at all levels!

```ts
store.mutation('add'); // Expected 2 arguments, but got 1.
store.mutation('add', 'life'); // Argument of type 'string' is not assignable to parameter of type 'number'.
store.mutation('prout'); // Argument of type '"prout"' is not assignable to parameter of type '"add" | "increment" | "reset"'.
```

---

Scaffolded with [@skarab/skaffold](https://www.npmjs.com/package/@skarab/skaffold)
