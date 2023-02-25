import { Screen, ScreenState } from './screen';
import { Bag, EcsInstance } from 'ecsf';

export class ScreenManager {
  _screens: Bag<Screen> = new Bag<Screen>();
  _ecs!: EcsInstance;

  set ecs(value: EcsInstance) {
    this._ecs = value;
  }

  async addScreen(screen: Screen): Promise<any> {
    screen.ecs = this._ecs;
    screen.screenState = ScreenState.Activating;
    screen.screenManger = this;
    screen.initialize();
    await screen.load();

    this._ecs.initialResolve();
    this._ecs.loadSystems();
    this._ecs.initialCreate();
    this._ecs.scheduleSystems();

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
    this._ecs.updateTime(delta);
    this._ecs.resolveEntities();
    this._ecs.runSystems();

    this._screens.forEach(screen => {
      screen &&
        screen.screenState === ScreenState.Active &&
        screen.update(delta);
    });

    this._screens.last?.focusUpdate(delta);
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
