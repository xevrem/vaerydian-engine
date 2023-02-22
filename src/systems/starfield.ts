import { EntitySystem, Entity, EntitySystemArgs, Query } from 'ecsf';
import { Position, Renderable, Starfield, Velocity } from 'components';
import { Vector } from 'utils/vector';
import { Application } from 'pixi.js';
import { is_none, is_some } from 'utils/helpers';

export class StarfieldSystem extends EntitySystem<
  [typeof Position, typeof Renderable, typeof Starfield],
  { app: Application }
> {
  app: Application;
  player!: Entity;
  distance!: number;

  constructor(props: EntitySystemArgs) {
    super({
      ...props,
      needed: [Position, Renderable, Starfield],
      app: props.app,
    });
    this.app = props.app;
  }

  initialize(): void {
    console.info('starfield system initializing...');
    this.distance = window.innerWidth / 1.14;
  }

  initialAdd(_entity: Entity) {
    const [position, renderable] = this.query.retrieve();
    renderable.container.position.set(position.point.x, position.point.y);
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
    if (is_none(playerPos) || is_none(playerVel)) return;
    const [position, _star] = query.retrieve();
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
