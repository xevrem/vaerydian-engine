import { EntitySystem, Entity, Query, EntitySystemArgs } from '../ecsf';
import { Rotation, Velocity, Heading, Controllable } from '../components';
import { KeyboardManager } from '../utils/keyboard';
import { KEYS } from '../utils/constants';
import { Point } from 'pixi.js';
import { Vector } from '../utils/vector';
import { all_some } from 'utils/helpers';

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
    if (!all_some(results)) {
      results;
      return;
    }
    const [rotation, velocity, _heading] = results;

    // by default we point straight up
    let amount = 0;
    let magnitude = 0;
    let thrust: Point = new Point(0, -1);

    if (KeyboardManager.isKeyPressed(KEYS.A)) {
      //rotate left
      amount -= rotation.rate * delta;
    }

    if (KeyboardManager.isKeyPressed(KEYS.D)) {
      //rotate right
      amount += rotation.rate * delta;
    }

    if (KeyboardManager.isKeyPressed(KEYS.W)) {
      // add 'forward' velocity
      magnitude += velocity.rate * delta;
      // thrust = Vector.add(thrust, new Point)
    }

    if (KeyboardManager.isKeyPressed(KEYS.S)) {
      // remove 'forward' velocity
      magnitude -= velocity.rate * delta;
    }

    thrust = Vector.multScalar(
      Vector.rotateVectorDegrees(thrust, rotation.amount + amount),
      magnitude
    );

    if (KeyboardManager.isKeyPressed(KEYS.SPACE)) {
      // we override the thrust to apply a breaking force
      const [vec, mag] = Vector.normalizeMag(
        Vector.rotateVectorDegrees(velocity.vector, 180)
      );
      thrust = Vector.multScalar(vec, mag * delta);
    }

    rotation.amount += amount;
    velocity.vector = Vector.add(velocity.vector, thrust);
  }
}
