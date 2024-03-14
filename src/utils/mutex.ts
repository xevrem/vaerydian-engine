// import { asyncSleep } from './utils';

/**
 * Inspired by the Semaphore code in `https://github.com/DirtyHairy/async-mutex`
 * but greatly simplified for our needs
 */

export declare type MutexRelease = () => Promise<void>;

export declare type SpinLock = (waitTime?: number) => Promise<void>;

export function asyncSleep(time: number): Promise<void> {
  return new Promise<void>(res => globalThis.setTimeout(() => res, time));
}

export declare type MutexQueueEntry = {
  releaser: MutexRelease;
  resolve: (releaser: MutexRelease) => void;
  reject: (err: Error) => void;
};

export class Mutex {
  private numTickets = 0;
  private queue: MutexQueueEntry[] = [];

  constructor(maxConcurrency = 1) {
    if (maxConcurrency <= 0)
      throw Error('maxConcurrency must be greater than 0');
    this.numTickets = maxConcurrency;
  }

  isLocked(): boolean {
    return this.numTickets <= 0;
  }

  lock(): [ticket: Promise<MutexRelease>, spinlock: SpinLock] {
    // get current lock state
    const locked = this.isLocked();
    // create a promise
    const ticket = new Promise<MutexRelease>((resolve, reject) => {
      let released = false;

      const releaser: MutexRelease = async () => {
        // if we've already released once, don't allow us to release again
        if (released) return;
        released = true;
        this.numTickets++;

        // dispatch whomever may be waiting
        this.dispatch();
      };

      this.queue.push({ resolve, reject, releaser });
    });

    /**
     * rough time
     */
    const spinlock: SpinLock = async (waitTime = 1) => {
      // wait until we're unlocked or the maxWaitTime has passed
      if (this.isLocked() && waitTime > 0) {
        await asyncSleep(1);
        await spinlock(waitTime - 1);
      } else {
        this.dispatch();
      }
    };

    // if the mutex wasn't locked when we acquired the lock dispatch this
    // ticket immediately
    if (!locked) this.dispatch();

    // return the ticket and a spinlock
    return [ticket, spinlock];
  }

  private dispatch(): void {
    const nextTicket = this.queue.shift();

    if (!nextTicket) return;

    this.numTickets--;

    nextTicket.resolve(nextTicket.releaser);
  }
}
