import { ScreenManager, GameScreen } from './screens';

const FRAME_TARGET: number = 1000 / 30;

export class Engine {
  lastTime = 0;
  screenManager: ScreenManager;

  constructor() {
    this.screenManager = new ScreenManager();
  }

  async start(): Promise<any> {
    await this.screenManager.addScreen(new GameScreen());

    this.startLoop();
  }

  startLoop(): void {
    console.log('engine running...');
    this.timeoutRun();
    // window.requestAnimationFrame(this.run);
  }

  run = (time: number): void => {
    const delta = time - this.lastTime;
    this.lastTime = time;

    const seconds = delta / 1000;
    // this.stats.begin();
    this.update(seconds);
    this.draw(seconds);
    // this.stats.end();

    window.requestAnimationFrame(this.run);
  };

  timeoutRun = (): void => {
    window.setTimeout(this.doPreFrame, FRAME_TARGET);
  };

  doPreFrame = (): void => {
    // compute delta time
    let time = performance.now();
    let delta = time - this.lastTime;

    // this.stats.begin();
    this.update(delta / 1000);
    this.draw();
    // this.stats.end();

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
