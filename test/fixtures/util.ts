export function parseStringOrNumber(state: unknown): string | number | never {
  if (!Number.isNaN(state)) {
    if (typeof state === 'string') return state;
    if (typeof state === 'number') return state;
  }
  const type = Number.isNaN(state) ? Number.NaN : typeof state;
  throw new Error(`expected 'string|number' got '${type}'`);
}
