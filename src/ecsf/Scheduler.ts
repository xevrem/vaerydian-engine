import { RootReducer } from 'types/modules';
import { globalGetState } from 'utils/utils';
import { EntitySystem } from './EntitySystem';

export class Scheduler {
  private _systems: EntitySystem[] = [];

  /**
   * currently scheduled systems
   */
  get systems(): EntitySystem[] {
    return this._systems;
  }

  /**
   * set the scheduled systems
   */
  set systems(value: EntitySystem[]) {
    this._systems = value;
  }

  /**
   * clean up systems
   */
  cleanUp(): void {
    this._systems = [];
  }

  /**
   * sort the systems by priority
   */
  sortSystems(): void {
    this._systems.sort(
      (a: EntitySystem, b: EntitySystem) => b.priority - a.priority
    );
  }

  /**
   * run the systems in order of priority
   */
  runSystems(state: RootReducer = globalGetState()): void {
    const systems = this._systems;
    for (let i = systems.length; i--; ) {
      const system = systems[i];
      if (system.active) {
        system.processAll(state);
        if (system.isReactive) system.entities.clear();
      }
    }
  }
}
