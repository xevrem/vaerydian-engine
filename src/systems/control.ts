import { EntitySystem, Entity, ComponentMapper } from '../ecsf';
import { Rotation, Velocity } from '../components';
import { KeyboardManager } from '../utils/keyboard';
import { Key } from '../utils/constants';
import { Point } from 'pixi.js';
import { Vector } from '../utils/vector';

export class ControlSystem extends EntitySystem {
  velocityMap: ComponentMapper;
  rotationMap: ComponentMapper;

  initialize() {
    console.log('control system initializing...');
    this.velocityMap = new ComponentMapper(new Velocity(), this.ecsInstance);
    this.rotationMap = new ComponentMapper(new Rotation(), this.ecsInstance);
  }

  process(entity: Entity, delta: number) {
    const velocity = this.velocityMap.get(entity) as Velocity;
    const rotation = this.rotationMap.get(entity) as Rotation;

    // by default we point straight up
    let amount = 0;
    let magnitude = velocity.magnitude;

    if (KeyboardManager.isKeyPressed(Key.A)) {
      //rotate left
      amount -= rotation.rate * delta;
    }

    if (KeyboardManager.isKeyPressed(Key.D)) {
      //rotate right
      amount += rotation.rate * delta;
    }

    if (KeyboardManager.isKeyPressed(Key.W)) {
      // add 'forward' velocity
      magnitude += velocity.rate * delta;
    }

    if (KeyboardManager.isKeyPressed(Key.S)) {
      // remove 'forward' velocity
      magnitude -= velocity.rate * delta;
    }

    // const thrust: Point = Vector.multScalar(
    //   Vector.rotateVectorDegrees(velocity.vector, amount),
    //   magnitude
    // );
    // const heading: Point = Vector.multScalar(
    //   velocity.vector,
    //   velocity.magnitude
    // );

    rotation.amount += amount;
    velocity.vector = Vector.rotateVectorDegrees(velocity.vector, amount),
    velocity.magnitude = magnitude;


  }
}
