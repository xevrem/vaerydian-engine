import {
  EntitySystem,
  Entity,
  EntitySystemArgs,
  Query,
  JoinedResult,
} from 'ecsf';
import { all_some, is_none, is_some } from 'onsreo';
import { Application } from 'pixi.js';
import { Position, Scene, Starfield, Velocity } from 'components';

type Props = { app: Application };

type Needed = [typeof Position, typeof Scene, typeof Starfield];

export class StarfieldSystem extends EntitySystem<Props, Needed> {
  app: Application;
  player!: Entity;
  distance!: number;

  constructor(props: EntitySystemArgs<Props, Needed>) {
    super({
      ...props,
      needed: [Position, Scene, Starfield],
      app: props.app,
    });
    this.app = props.app;
  }

  initialize(): void {
    console.info('starfield system initializing...');
    this.distance = window.innerWidth / 1.14;
  }

  created(_entity: Entity) {
    const [position, scene, _starfield] = this.query.retrieve();
    scene.asset.position = position.value;
  }

  load(): void {
    const maybePlayer = this.ecsInstance.getEntityByTag('player');
    if (is_some(maybePlayer)) {
      this.player = maybePlayer;
    }
  }

  join([[position, scene], _ent]: JoinedResult<Needed>): void {
    const [playerPosition, playerVelocity] = this.ecs.retrieve(this.player, [
      Position,
      Velocity,
    ]);
    const distance = position.value.distanceTo(playerPosition.value);
    if (distance > this.distance) {
      const angle = Math.random() * 120 - 60;
      const projVec = playerVelocity.vector.rotateDeg(angle).normalize();
      const projPos = projVec.multScalar(this.distance - Math.random() * 200);
      position.value = playerPosition.value.add(projPos);
      scene.asset.position = position.value.toPoint();
    }
  }
}
