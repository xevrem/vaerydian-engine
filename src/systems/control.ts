import { EntitySystem, Entity, ComponentMapper } from '../ecsf';
import { Rotation, Velocity, Heading } from '../components';
import { KeyboardManager } from '../utils/keyboard';
import { KeyType } from '../utils/constants';
import { Point } from 'pixi.js';
import { Vector } from '../utils/vector';

export class ControlSystem extends EntitySystem {
  rotationMap: ComponentMapper;
  velocityMap: ComponentMapper;

  initialize() {
    console.log('control system initializing...');
    this.rotationMap = new ComponentMapper(new Rotation(), this.ecsInstance);
    this.velocityMap = new ComponentMapper(new Velocity(), this.ecsInstance);
  }

  process(entity: Entity, delta: number) {
    const rotation = this.rotationMap.get(entity) as Rotation;
    const velocity = this.velocityMap.get(entity) as Velocity;

    // by default we point straight up
    let amount = 0;
    let magnitude = 0;
    let thrust: Point = new Point(0, -1);

    if (KeyboardManager.isKeyPressed(KeyType.A)) {
      //rotate left
      amount -= rotation.rate * delta;
    }

    if (KeyboardManager.isKeyPressed(KeyType.D)) {
      //rotate right
      amount += rotation.rate * delta;
    }

    if (KeyboardManager.isKeyPressed(KeyType.W)) {
      // add 'forward' velocity
      magnitude += velocity.rate * delta;
      // thrust = Vector.add(thrust, new Point)
    }

    if (KeyboardManager.isKeyPressed(KeyType.S)) {
      // remove 'forward' velocity
      magnitude -= velocity.rate * delta;
    }

    thrust = Vector.multScalar(
      Vector.rotateVectorDegrees(thrust, rotation.amount + amount),
      magnitude
    );

    if (KeyboardManager.isKeyPressed(KeyType.SPACE)) {
      // we override the thrust to apply a breaking force
      const [vec, mag] = Vector.normalizeMag(
        Vector.rotateVectorDegrees(velocity.vector, 180)
      );
      thrust = Vector.multScalar(vec, mag/100);
    }

    rotation.amount += amount;
    velocity.vector = Vector.add(velocity.vector, thrust);
  }
}
