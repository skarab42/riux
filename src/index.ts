import type { Draft, Immutable, Nothing } from 'immer/dist/internal.js';
import { produce } from 'immer';

// ----------------------------------------------------------------------------

export interface Options {
  /** Should freeze the initial state outside of `createStore`? (default: true) */
  freezeInitialState?: boolean;
}

// ----------------------------------------------------------------------------

export type InitialState<TState, TOptions extends Options> = true extends TOptions['freezeInitialState']
  ? Immutable<TState>
  : TState;

export type CurrentState<TState> = Immutable<TState>;

// ----------------------------------------------------------------------------

export type DraftState<TState> = Draft<Immutable<TState>>;

export type RecipeReturn<TState> =
  | (DraftState<TState> extends undefined ? Nothing : never)
  | DraftState<TState>
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  | void;

export type Recipe<TState> = (draft: DraftState<TState>) => RecipeReturn<TState>;

// ----------------------------------------------------------------------------

export type Subscriber<TState> = (state: Immutable<TState>) => void;

export interface Subscription {
  on: () => Subscription;
  off: () => boolean;
}

// ----------------------------------------------------------------------------

export interface Store<TState, TOptions> {
  /** Return the initial state (maybe immutable). */
  initial(): InitialState<TState, TOptions>;
  /** Return the current state (immutable). */
  current(): CurrentState<TState>;
  /** Update and return a new immutable state. */
  update(recipe: Recipe<TState>): CurrentState<TState>;
  /** Subscribe to store update event. */
  subscribe(subscriber: Subscriber<TState>): Subscription;
  /** Unsubscribe from store update event. */
  unsubscribe(subscriber: Subscriber<TState>): boolean;
}

// ----------------------------------------------------------------------------

export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

// ----------------------------------------------------------------------------

export function createStore<TState, TOptions extends Options>(
  initialState: InitialState<TState, TOptions>,
  options?: TOptions,
): Store<TState, TOptions> {
  const { freezeInitialState } = { freezeInitialState: true, ...options };

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
