import { Screen, ScreenState } from './screen';
import { Bag } from '../ecsf';

export class ScreenManager {
  _screens: Bag<Screen> = new Bag<Screen>();

  async addScreen(screen: Screen): Promise<any> {
    screen.screenState = ScreenState.Activating;
    screen.screenManger = this;
    screen.initialize();
    await screen.load();
    screen.screenState = ScreenState.Active;
    this._screens.add(screen);
  }

  removeScreen(screen: Screen): void {
    screen.screenState = ScreenState.Deactivating;
    screen.unload();
    this._screens.remove(screen);
  }

  update(delta: number): void {
    this._screens.forEach(screen => {
      screen.screenState === ScreenState.Active && screen.update(delta);
    });

    this._screens.slice(-1).forEach(screen => screen.focusUpdate(delta));
  }

  draw(delta: number): void {
    this._screens.forEach(
      screen =>
        screen.screenState !== ScreenState.Inactive && screen.draw(delta)
    );
  }
}
