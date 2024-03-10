import { EntitySystem, EntitySystemArgs, JoinedResult } from 'ecsf';
import { Rotation, Velocity, Heading, Controllable } from '../components';
import { KeyboardManager } from '../utils/keyboard';
import { KEYS } from '../utils/constants';

type Props = {};
type Needed = [
  typeof Rotation,
  typeof Velocity,
  typeof Heading,
  typeof Controllable,
];

export class ControlSystem extends EntitySystem<Props, Needed> {
  constructor(props: EntitySystemArgs<Props, Needed>) {
    super({
      ...props,
      needed: [Rotation, Velocity, Heading, Controllable],
    });
  }

  join(results: JoinedResult<Needed, []>, delta: number) {
    const [[rotation, velocity, heading], _ent] = results;
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

    if (amount !== 0) {
      heading.value = heading.value.rotate(amount);
      rotation.value = heading.value.angle();
    }

    if (thrust !== 0) {
      velocity.vector = heading.value
        .multScalar(thrust)
        .add(velocity.vector)
        .clamp(-velocity.rate, velocity.rate);
    }

    // velocity.vector = velocity.vector.add(thrust).clamp(0, 300);
    // heading.vector = heading.vector.add(thrust).normalize();
  }
}
