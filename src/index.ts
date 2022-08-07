import { type Immutable, produce } from 'immer';

export interface Options {
  /** Should freeze the initial state outside of `createStore`? (default: true) */
  freezeInitialState?: boolean;
}

export const defaultOptions: Required<Options> = {
  freezeInitialState: true,
};

export type DefaultOptions = typeof defaultOptions;

export type InitialState<TState, TOptions extends Options> = true extends TOptions['freezeInitialState']
  ? Immutable<TState>
  : TState;

export type CurrentState<TState, TOptions extends Options> = Immutable<InitialState<TState, TOptions>>;

export interface Store<TState, TOptions extends Options> {
  /** Return the initial state (maybe immutable). */
  initial(): InitialState<TState, TOptions>;
  /** Return the current state (immutable). */
  current(): CurrentState<TState, TOptions>;
}

/**
 * Create and return a new immutable {@link Store} object.
 */
export function createStore<TState, TOptions extends Options = DefaultOptions>(
  initialState: InitialState<TState, TOptions>,
  options?: TOptions,
): Store<TState, TOptions> {
  const { freezeInitialState } = { ...defaultOptions, ...options };

  if (!freezeInitialState) {
    initialState = { ...initialState };
  }

  const currentState = produce(initialState, (draft) => draft) as CurrentState<TState, TOptions>;

  function initial(): InitialState<TState, TOptions> {
    return initialState;
  }

  function current(): CurrentState<TState, TOptions> {
    return currentState;
  }

  return { initial, current };
}
