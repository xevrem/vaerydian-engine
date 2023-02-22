import { EntitySystem, Entity, EntitySystemArgs, Query } from 'ecsf';
import { Renderable, Position, Rotation } from 'components';
import { Application, Container } from 'pixi.js';
import { is_some, all_some } from 'utils/helpers';

export class RenderSystem extends EntitySystem<
  [typeof Renderable, typeof Position, typeof Rotation],
  { app: Application }
> {
  app: Application;
  spriteContainer!: Container;

  constructor(props: EntitySystemArgs) {
    super({
      ...props,
      needed: [Renderable, Position, Rotation],
      app: props.app,
    });
    this.app = props.app;
  }

  initialize() {
    console.info('sprite system initializing...');
    this.spriteContainer = new Container();
    this.app.stage.addChild(this.spriteContainer);
  }

  added(entity: Entity) {
    const spriteRender = this.ecs.getComponent(entity, Renderable);
    is_some(spriteRender) &&
      this.spriteContainer.addChild(spriteRender.container);
  }

  removed(entity: Entity) {
    const spriteRender = this.ecs.getComponent(entity, Renderable);
    is_some(spriteRender) &&
      this.spriteContainer.removeChild(spriteRender.container);
  }

  process(_: Entity, query: Query<typeof this.needed>) {
    const results = query.retrieve();
    if (!all_some(results)) return;
    const [renderable, position, rotation] = results;

    renderable.container.position.set(
      position.point.x - renderable.offset.x,
      position.point.y - renderable.offset.y
    );

    renderable.container.pivot.set(renderable.pivot.x, renderable.pivot.y);

    renderable.container.angle = rotation
      ? rotation.amount
      : renderable.container.angle;
  }
}
