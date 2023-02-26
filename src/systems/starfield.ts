import { EntitySystem, Entity, EntitySystemArgs, Query } from 'ecsf';
import { Position, Scene, Starfield, Velocity, } from 'components';
import { Application } from 'pixi.js';
import { is_none, is_some } from 'utils/helpers';

export class StarfieldSystem extends EntitySystem<
  [typeof Position, typeof Scene, typeof Starfield],
  { app: Application }
> {
  app: Application;
  player!: Entity;
  distance!: number;

  constructor(props: EntitySystemArgs) {
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
    const [position, renderable] = this.query.retrieve();
    renderable.asset.position = position.value;//.set(position.point.x, position.point.y);
  }

  load(): void {
    const maybePlayer = this.ecsInstance.getEntityByTag('player');
    if (is_some(maybePlayer)) {
      this.player = maybePlayer;
    }
  }

  process(_: Entity, query: Query<typeof this.needed>): void {
    const playerPosition = this.ecs.getComponent(this.player, Position);
    const playerVelocity = this.ecs.getComponent(this.player, Velocity);
    if (is_none(playerPosition) || is_none(playerVelocity)) return;
    const [position, renderable, _star] = query.retrieve();
    const distance = position.value.distanceTo(playerPosition.value);
    if (distance > this.distance) {
      const angle = Math.random() * 120 - 60;
      const projVec = playerVelocity.vector.rotateDeg(angle).normalize();
      const projPos = projVec.multScalar(this.distance - Math.random() * 200);
      position.value = playerPosition.value.add(projPos);
      renderable.asset.position = position.value.toPoint();
    }
  }
}
