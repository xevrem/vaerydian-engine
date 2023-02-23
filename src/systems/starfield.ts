import { EntitySystem, Entity, EntitySystemArgs, Query } from 'ecsf';
import { Heading, Position, Renderable, Starfield, } from 'components';
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

  created(_entity: Entity) {
    const [position, renderable] = this.query.retrieve();
    renderable.container.position = position.point;//.set(position.point.x, position.point.y);
  }

  load(): void {
    const maybePlayer = this.ecsInstance.getEntityByTag('player');
    if (is_some(maybePlayer)) {
      this.player = maybePlayer;
    }
  }

  process(_: Entity, query: Query<typeof this.needed>): void {
    const playerPos = this.ecs.getComponent(this.player, Position);
    const playerHeading = this.ecs.getComponent(this.player, Heading);
    if (is_none(playerPos) || is_none(playerHeading)) return;
    const [position, renderable, _star] = query.retrieve();
    const distance = position.point.distanceTo(playerPos.point);
    if (distance > this.distance) {
      const angle = Math.random() * 120 - 60;
      const projVec = playerHeading.vector.rotateDeg(angle).normalize();
      const projPos = projVec.multScalar(this.distance - Math.random() * 200);
      position.point = playerPos.point.add(projPos);
      renderable.container.position = position.point.toPoint();
    }
  }
}
