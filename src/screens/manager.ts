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
    const index = this._screens.add(screen);
    screen.id = index;
  }

  removeScreen(screen: Screen): void {
    screen.screenState = ScreenState.Deactivating;
    screen.unload();
    this._screens.removeAt(screen.id);
  }

  update(delta: number): void {
    this._screens.forEach(screen => {
      screen &&
        screen.screenState === ScreenState.Active &&
        screen.update(delta);
    });

    this._screens.last?.focusUpdate(delta);
    // this._screens
    //   .slice(this._screens.count - 1)
    //   .forEach(screen => screen && screen.focusUpdate(delta));
  }

  draw(delta: number): void {
    this._screens.forEach(
      screen =>
        screen &&
        screen.screenState !== ScreenState.Inactive &&
        screen.draw(delta)
    );
  }
}
