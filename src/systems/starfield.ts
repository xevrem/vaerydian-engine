import {
  EntitySystem,
  Entity,
  ComponentMapper,
  EntitySystemArgs,
  Query,
} from '../ecsf';
import { Position, Velocity } from '../components';

import { Vector } from '../utils/vector';
import { Application } from 'pixi.js';
import { all_some, is_none, is_some } from 'utils/helpers';

export class StarfieldSystem extends EntitySystem<
  [typeof Position, typeof Velocity],
  { app: Application }
> {
  app: Application;
  player!: Entity;
  // positionMap!: ComponentMapper;
  // velocityMap!: ComponentMapper;
  distance!: number;

  constructor(props: EntitySystemArgs) {
    super({
      ...props,
      needed: [Position, Velocity],
      app: props.app,
    });
    this.app = props.app;
  }

  initialize(): void {
    console.log('starfield system initializing...');
    // this.positionMap = new ComponentMapper(new Position(), this.ecsInstance);
    // this.velocityMap = new ComponentMapper(new Velocity(), this.ecsInstance);
    this.distance = window.innerWidth / 1.14;
  }

  load(): void {
    const maybePlayer = this.ecsInstance.getEntityByTag('player');
    if (is_some(maybePlayer)) {
      this.player = maybePlayer;
    }
  }

  process(_: Entity, query: Query<typeof this.needed>): void {
    const playerPos = this.ecs.getComponent(this.player, Position);
    const playerVel = this.ecs.getComponent(this.player, Velocity);
    const results = query.retrieve();
    if (!all_some(results) || is_none(playerPos) || is_none(playerVel)) return;
    const [position, _velocity] = results;
    const distance = Vector.distance(position.point, playerPos.point);
    if (distance > this.distance) {
      const angle = Math.random() * 120 - 60;
      const projVec = Vector.normalize(
        Vector.rotateVectorDegrees(playerVel.vector, angle)
      );
      const projPos = Vector.multScalar(
        projVec,
        this.distance - Math.random() * 200
      );
      position.point = Vector.add(playerPos.point, projPos);
    }
  }
}
