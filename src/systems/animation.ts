import { EntitySystem, Entity, ComponentMapper } from "../ecsf";
import { Animatable } from "../components";


export class AnimationSystem extends EntitySystem {
  animatableMapper: ComponentMapper;

  initialize() {
    console.log('animation system initializing...')
    this.animatableMapper = this.ecsInstance.makeMapper(new Animatable());
  }

  process(entity: Entity, delta: number) {
    const animatable = this.animatableMapper.get(entity) as Animatable;
  }
}
