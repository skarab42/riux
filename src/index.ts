import { type Immutable, produce, Draft } from 'immer';
import type { Nothing } from 'immer/dist/internal.js';

// ---

export interface Options {
  /** Should freeze the initial state outside of `createStore`? (default: true) */
  freezeInitialState?: boolean;
}

export const defaultOptions: Required<Options> = {
  freezeInitialState: true,
};

export type DefaultOptions = typeof defaultOptions;

// ---

export type InitialState<TState, TOptions extends Options> = true extends TOptions['freezeInitialState']
  ? Immutable<TState>
  : TState;

export type CurrentState<TState> = Immutable<TState>;

// ---

export type Subscriber<TState> = (state: Immutable<TState>) => void;

export interface Subscription {
  on: () => Subscription;
  off: () => boolean;
}

// ---

export type DraftState<TState> = Draft<Immutable<TState>>;

export type RecipeReturn<TState> =
  | (DraftState<TState> extends undefined ? Nothing : never)
  | DraftState<TState>
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void;

export type Recipe<TState> = (draft: DraftState<TState>) => RecipeReturn<TState>;

// ---

export interface Store<TState, TOptions extends Options> {
  /** Return the initial state (maybe immutable). */
  initial(): InitialState<TState, TOptions>;
  /** Return the current state (immutable). */
  current(): CurrentState<TState>;
  /** Subscribe to store update event. */
  subscribe(subscriber: Subscriber<TState>): Subscription;
  /** Unsubscribe from store update event. */
  unsubscribe(subscriber: Subscriber<TState>): boolean;
  /** Update and return a new immutable state. */
  update(recipe: Recipe<TState>): CurrentState<TState>;
}

// ---

export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

/**
 * Create and return a new immutable {@link Store} object.
 */
export function createStore<TState, TOptions extends Options = DefaultOptions>(
  initialState: InitialState<TState, TOptions>,
  options?: TOptions,
): Store<TState, TOptions> {
  const { freezeInitialState } = { ...defaultOptions, ...options };

  if (!freezeInitialState && isObject(initialState)) {
    initialState = { ...initialState };
  }

  let currentState = produce(initialState, (draft) => draft) as CurrentState<TState>;

  function initial(): InitialState<TState, TOptions> {
    return initialState;
  }

  function current(): CurrentState<TState> {
    return currentState;
  }

  const subscribers = new Set<Subscriber<TState>>();

  function unsubscribe(subscriber: Subscriber<TState>): boolean {
    return subscribers.delete(subscriber);
  }

  function subscribe(subscriber: Subscriber<TState>): Subscription {
    subscribers.add(subscriber);

    return {
      on: () => subscribe(subscriber),
      off: () => unsubscribe(subscriber),
    };
  }

  function update(recipe: Recipe<TState>): CurrentState<TState> {
    currentState = produce(currentState, recipe);

    for (const subscriber of subscribers) {
      subscriber(currentState);
    }

    return currentState;
  }

  return { initial, current, subscribe, unsubscribe, update };
}
