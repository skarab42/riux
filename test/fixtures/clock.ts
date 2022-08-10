import { immerable, produce } from 'immer';

// From https://immerjs.github.io/immer/complex-objects/#example
export class Clock {
  hour: number;
  minute: number;

  constructor(hour: number, minute: number) {
    this.hour = hour;
    this.minute = minute;
  }

  get time(): string {
    return `${this.hour}:${this.minute}`;
  }

  tick(): this {
    return produce(this, (draft) => {
      draft.minute++;
    });
  }
}

export class ImmerableClock extends Clock {
  [immerable] = true;
}
