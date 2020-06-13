import { ScreenManager, GameScreen } from './screens';
import Stats from 'stats.js';

const FRAME_TARGET: number = 1000 / 30;

export class Engine {
  lastTime = 0;
  screenManager: ScreenManager;
  stats: Stats;

  constructor() {
    this.screenManager = new ScreenManager();

    this.stats = new Stats();
    document.body.append(this.stats.dom);
  }

  async start(): Promise<any> {
    await this.screenManager.addScreen(new GameScreen());

    this.startLoop();
  }

  startLoop(): void {
    console.log('engine running...');
    // this.timeoutLoop();
    window.requestAnimationFrame(this.runLoop);
  }

  runLoop = (time: number): void => {
    const delta = time - this.lastTime;
    this.lastTime = time;

    const seconds = delta / 1000;
    this.stats.begin();
    this.update(seconds);
    this.draw(seconds);
    this.stats.end();

    window.requestAnimationFrame(this.runLoop);
  };

  timeoutLoop = (): void => {
    window.setTimeout(this.doPreFrame, FRAME_TARGET);
  };

  doPreFrame = (): void => {
    // compute delta time
    const time = performance.now();
    const delta = time - this.lastTime;

    const seconds = delta / 1000;

    this.stats.begin();
    this.update(seconds);
    this.draw(seconds);
    this.stats.end();

    let frameTime = performance.now() - time;
    this.lastTime = time;

    if (frameTime < FRAME_TARGET) {
      window.setTimeout(this.doPreFrame, FRAME_TARGET - frameTime);
    } else {
      // skip the frame calculating time for next frame
      window.setTimeout(
        this.doPreFrame,
        FRAME_TARGET - (frameTime - FRAME_TARGET)
      );
    }
  };

  update(delta: number) {
    this.screenManager.update(delta);
  }

  draw(delta: number) {
    this.screenManager.draw(delta);
  }
}
