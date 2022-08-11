import type { Draft, Immutable, Nothing } from 'immer/dist/internal.js';
import { produce } from 'immer';

export type DraftState<TState> = Draft<Immutable<TState>>;

export type RecipeReturn<TState> =
  | (DraftState<TState> extends undefined ? Nothing : never)
  | DraftState<TState>
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void;

export type Recipe<TState> = (draft: DraftState<TState>) => RecipeReturn<TState>;

export type InitialState<TState, TImmutable> = true extends TImmutable ? Immutable<TState> : TState;

export type Subscriber<TState> = (state: Immutable<TState>) => void;

export interface Subscription {
  enable: () => Subscription;
  disable: () => boolean;
}

export type InferRestArguments<TFunction> = TFunction extends (draft: any, ...restArguments: infer TRest) => any
  ? TRest
  : [];

export type MutationFunction<TState, TMutations> = <TName extends keyof TMutations>(
  name: TName,
  ...restArguments: InferRestArguments<TMutations[TName]>
) => Immutable<TState>;

export type InternalMutationFunction<TState, TMutations> = <TName extends keyof TMutations>(
  state: TState | Immutable<TState>,
  name: TName,
  ...restArguments: InferRestArguments<TMutations[TName]>
) => Immutable<TState>;

export type Mutation<TState> = (draft: DraftState<TState>, ...restArguments: any[]) => RecipeReturn<TState>;

export type Mutations<TState> = Record<string, Mutation<TState>>;

export type ActionFunction<TState, TActions> = <TName extends keyof TActions>(
  name: TName,
  ...restArguments: InferRestArguments<TActions[TName]>
) => Immutable<TState>;

export type Action<TState, TMutations> = (
  mutation: MutationFunction<TState, TMutations>,
  ...restArguments: any[]
) => // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
undefined | void;

export type Actions<TState, TMutations> = Record<string, Action<TState, TMutations>>;

export interface Options<TState, TFreezeInitialState extends boolean, TMutations, TActions> {
  /** Should freeze the initial state? */
  freezeInitialState?: TFreezeInitialState;
  /** Should be a function that validates/casts the state before finalizing the draft and either returns a strongly typed value (if valid) or throws an error (if invalid). */
  parse?: (state: unknown) => TState;
  /** A record of mutations. */
  mutations?: TMutations & Mutations<TState>;
  /** A record of actions. */
  actions?: TActions & Actions<TState, TMutations>;
}

export interface Store<TState, TMutations, TActions> {
  /** Return the initial state. */
  initial(): Immutable<TState>;

  /** Return the current state. */
  current(): Immutable<TState>;

  /**
   * Update the state and notify any subscribers.
   *
   * @param recipe - An immer [recipe](https://immerjs.github.io/immer/produce).
   * @returns Current state.
   */
  update(recipe: Recipe<TState>): Immutable<TState>;

  /**
   * Subscribe to state update event.
   *
   * @param subscriber - A {@link Subscriber} function which takes the current state as its first argument.
   * @returns A {@link Subscription} object with enable/disable methods.
   */
  subscribe(subscriber: Subscriber<TState>): Subscription;

  /**
   * Unsubscribe from state update event.
   *
   * @param subscriber - A {@link Subscriber} function which takes the current state as its first argument.
   * @returns true if unsubscribed, false if never/already unsubribed.
   */
  unsubscribe(subscriber: Subscriber<TState>): boolean;

  /**
   * Call a mutation and return the current state.
   *
   * @param name - Mutation name.
   * @param argument - Zero or more argument to pass to the mutation.
   * @throws If the mutation does not exist.
   * @returns Current state.
   */
  mutation: MutationFunction<TState, TMutations>;

  /**
   * Call an action and return the current state.
   *
   * @param name - Action name.
   * @param argument - Zero or more argument to pass to the action.
   * @throws If the action does not exist.
   * @returns Current state.
   */
  action: ActionFunction<TState, TActions>;
}

export type InferState<TType> = TType extends Store<infer TState, unknown, unknown> ? TState : never;
export type InferMutations<TType> = TType extends Store<unknown, infer TMutations, unknown> ? TMutations : never;
export type InferActions<TType> = TType extends Store<unknown, unknown, infer TActions> ? TActions : never;

export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

/**
 * Creates a typed and immutable store around the [immer](https://immerjs.github.io/immer/) library.
 *
 * Plain objects (objects without a prototype), arrays, Maps and Sets are always drafted by Immer. Every other object must use the [immerable](https://immerjs.github.io/immer/complex-objects) symbol to mark itself as compatible with Immer.
 *
 * @param initialState - Any [immerable](https://immerjs.github.io/immer/complex-objects) value.
 * @param options - Some {@link Options}.
 * @returns A typed and immutable {@link Store}.
 */
export function createStore<TState, TFreezeInitialState extends boolean, TMutations, TActions>(
  initialState: InitialState<TState, TFreezeInitialState>,
  options?: Options<TState, TFreezeInitialState, TMutations, TActions>,
): Store<TState, TMutations, TActions> {
  const { freezeInitialState, mutations, actions, parse } = { freezeInitialState: true, ...options };

  if (parse && typeof parse !== 'function') {
    throw new Error(`'options.parse' should be a function got '${typeof parse}'`);
  }

  if (!freezeInitialState && isObject(initialState)) {
    initialState = { ...initialState };
  }

  function produceAndParse(state: TState | Immutable<TState>, recipe: Recipe<TState>): Immutable<TState> {
    let newState = produce(state, recipe);

    if (parse) {
      newState = parse(newState);
    }

    return newState as Immutable<TState>;
  }

  let currentState = produceAndParse(initialState, (draft) => draft);

  const subscribers = new Set<Subscriber<TState>>();

  function notify(): Immutable<TState> {
    for (const subscriber of subscribers) {
      subscriber(currentState);
    }

    return currentState;
  }

  const mutation: InternalMutationFunction<TState, TMutations> = (
    state: TState | Immutable<TState>,
    name,
    ...restArguments
  ) => {
    const mutation = mutations?.[name];

    if (!mutation) {
      throw new Error(`Undefined mutation: ${String(name)}`);
    }

    return produceAndParse(state, (draft) => mutation(draft, ...restArguments));
  };

  const store: Store<TState, TMutations, TActions> = {
    initial() {
      return initialState as Immutable<TState>;
    },
    current() {
      return currentState;
    },
    update(recipe) {
      currentState = produceAndParse(currentState, recipe);

      return notify();
    },
    unsubscribe(subscriber) {
      return subscribers.delete(subscriber);
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);

      return {
        enable: () => this.subscribe(subscriber),
        disable: () => this.unsubscribe(subscriber),
      };
    },
    mutation(name, ...restArguments) {
      currentState = mutation(currentState, name, ...restArguments);

      return notify();
    },
    action(name, ...restArguments) {
      const action = actions?.[name];

      if (!action) {
        throw new Error(`Undefined action: ${String(name)}`);
      }

      let temporaryState = currentState;

      action((name, ...rest) => (temporaryState = mutation(temporaryState, name, ...rest)), ...restArguments);

      currentState = temporaryState;

      return notify();
    },
  };

  return store;
}

export const store = createStore;
