import { Mutex } from './mutex';
import { asyncSleep } from './utils';

describe('Mutex', () => {
  it('should be unlocked by default', () => {
    const mutex = new Mutex();
    expect(mutex.isLocked()).toBeFalsy();
  });

  it('should lock after after acquiring a lock', () => {
    const mutex = new Mutex();
    mutex.lock();
    expect(mutex.isLocked()).toBeTruthy();
  });

  it('should unlock after after using a lock release', async () => {
    const mutex = new Mutex();
    const [ticket] = mutex.lock();
    const release = await ticket;
    expect(mutex.isLocked()).toBeTruthy();
    release();
    expect(mutex.isLocked()).toBeFalsy();
  });

  it.skip('should be able to spinlock', async () => {
    const mutex = new Mutex();
    const [ticket, spinlock] = mutex.lock();
    ticket.then((res) => setTimeout(res, 10));
    expect(mutex.isLocked()).toBeTruthy();
    const start = performance.now();
    await spinlock(5);
    const stop = performance.now();
    expect(mutex.isLocked()).toBeTruthy();
    // the spinlock should have waited for less than 10ms
    expect(stop - start).toBeLessThan(10);
    // wait another 5ms and it should unlock
    await asyncSleep(5);
    expect(mutex.isLocked()).toBeFalsy();
  });

  it('should resolve the first lock first, then the second, then the third', async () => {
    const mutex = new Mutex();
    const lockState: Record<string, number> = {};
    let value = 0;
    const [lock1] = mutex.lock();
    lock1.then((res) => {
      lockState['l1'] = value++;
      res();
    });
    const [lock2] = mutex.lock();
    lock2.then((res) => {
      lockState['l2'] = value++;
      res();
    });
    const [lock3] = mutex.lock();
    lock3.then((res) => {
      lockState['l3'] = value++;
      res();
    });

    await Promise.all([lock3, lock2, lock1]);
    expect(lockState['l1']).toEqual(0);
    expect(lockState['l2']).toEqual(1);
    expect(lockState['l3']).toEqual(2);
    expect(value).toEqual(3);
  });

  it('should handle larger concurrency', async () => {
    const mutex = new Mutex(2);
    const [t1] = mutex.lock();
    const l1 = await t1;
    // should not be locked yet
    expect(mutex.isLocked()).toBeFalsy();
    const [t2] = mutex.lock();
    const l2 = await t2;
    // should be locked now we have locked again
    expect(mutex.isLocked()).toBeTruthy();
    // should unlock after l1 resolves
    await l1();
    expect(mutex.isLocked()).toBeFalsy();
    await l2();
    // should remain unlocked
    expect(mutex.isLocked()).toBeFalsy();
  });
});
