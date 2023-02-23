import { EntitySystem, Entity, Query, EntitySystemArgs } from 'ecsf';
import { Rotation, Velocity, Heading, Controllable } from 'components';
import { KeyboardManager } from 'utils/keyboard';
import { KEYS } from 'utils/constants';
import { Vector2 } from 'utils/vector';

export class ControlSystem extends EntitySystem<
  [typeof Rotation, typeof Velocity, typeof Heading, typeof Controllable]
> {
  constructor(props: EntitySystemArgs) {
    super({
      ...props,
      needed: [Rotation, Velocity, Heading, Controllable],
    });
  }

  process(
    _entity: Entity,
    query: Query<typeof this.needed, [], []>,
    delta: number
  ) {
    const results = query.retrieve();
    const [rotation, velocity, heading] = results;

    // by default we point straight up
    let amount = 0;
    // let magnitude = 0;
    let thrust = 0;

    if (KeyboardManager.isKeyPressed(KEYS.A)) {
      //rotate left
      amount = -rotation.rate * delta;
    } else if (KeyboardManager.isKeyPressed(KEYS.D)) {
      //rotate right
      amount = rotation.rate * delta;
    }

    if (KeyboardManager.isKeyPressed(KEYS.W)) {
      // add 'forward' velocity
      thrust = velocity.rate * delta;
    } else if (KeyboardManager.isKeyPressed(KEYS.S)) {
      // remove 'reverse' velocity
      thrust = -velocity.rate * delta;
    } 

    // thrust = thrust.rotateDeg(amount).multScalar(magnitude);

    if (KeyboardManager.isKeyPressed(KEYS.SPACE)) {
      // we override the thrust to apply a breaking force
      // const [vec, mag] = velocity.vector.rotateDeg(180).normalizeMag();
      // thrust = vec.multScalar(mag * delta);
    }

    if(amount !== 0){
      heading.vector = heading.vector.rotate(amount);
      rotation.amount = heading.vector.angle();
    }

    if(thrust !== 0){
      velocity.vector = heading.vector.multScalar(thrust).add(velocity.vector).clamp(-velocity.rate, velocity.rate);
    }

    // velocity.vector = velocity.vector.add(thrust).clamp(0, 300);
    // heading.vector = heading.vector.add(thrust).normalize();
  }
}
