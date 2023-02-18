import { EntitySystem, Entity, Query } from '../ecsf';
import { Rotation, Velocity, Heading, Controllable } from '../components';
import { KeyboardManager } from '../utils/keyboard';
import { KEYS } from '../utils/constants';
import { Point } from 'pixi.js';
import { Vector } from '../utils/vector';

export class ControlSystem extends EntitySystem {
  needed = [Controllable, Velocity, Rotation];
  // headingMap!: ComponentMapper;
  // rotationMap!: ComponentMapper;
  // velocityMap!: ComponentMapper;

  // initialize() {
  //   console.log('control system initializing...');
  //   // this.headingMap = new ComponentMapper(new Heading(), this.ecsInstance);
  //   // this.rotationMap = new ComponentMapper(new Rotation(), this.ecsInstance);
  //   // this.velocityMap = new ComponentMapper(new Velocity(), this.ecsInstance);
  // }

  process(entity: Entity, query: Query, delta: number) {
    const [rotation, velocity, heading] = query.retrieve(entity, [
      Rotation,
      Velocity,
      Heading,
    ]);
    // const velocity = this.velocityMap.get(entity) as Velocity;
    // const heading = this.headingMap.get(entity) as Heading;

    // by default we point straight up
    let amount = 0;
    let magnitude = 0;
    let thrust: Point = new Point(0, -1);

    if (KeyboardManager.isKeyPressed(KEYS.A)) {
      // console.log('a pressed', delta);
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
