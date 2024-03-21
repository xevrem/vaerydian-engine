
export function makeTimer(deltaMax: number) {
  let start = performance.now();
  let stop = Number.MAX_SAFE_INTEGER;
  let delta = 0;

  function begin(): void {
    start = performance.now();
  }

  function end(text: string, ...args: any[]): void {
    stop = performance.now();

    delta = stop - start;

    if (delta > deltaMax) {
      console.info(`ms: ${delta} -`, text, ...args);
    }
  }

  return {
    begin,
    end,
    get delta(): number {
      return delta;
    },
  };
}

export function lerp(a: number, b: number, percent: number): number {
  return (b - a) * percent + a;
}
