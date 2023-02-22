import { EntitySystem, Entity, ComponentMapper } from "../ecsf";
import { Animatable } from "../components";


export class AnimationSystem extends EntitySystem {
  // animatableMapper: ComponentMapper;

  initialize(): void {
    console.info('animation system initializing...');
    // this.animatableMapper = this.ecsInstance.makeMapper(new Animatable());
  }

  // process(entity: Entity, delta: number): void {
  //   // const animatable = this.animatableMapper.get(entity) as Animatable;
  // }
}
