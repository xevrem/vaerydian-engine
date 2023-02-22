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

  initialAdd(entity: Entity): void {
    const spriteRender = this.ecs.getComponent(entity, Renderable);
    if (is_some(spriteRender)) {
      this.spriteContainer.addChild(spriteRender.container);
      console.log('rs:ia::added', entity.id);
    }
  }

  initialCreate(entity: Entity) {
    console.log('rs:ic::');
  }

  added(entity: Entity) {
    const spriteRender = this.ecs.getComponent(entity, Renderable);
    if (is_some(spriteRender)) {
      this.spriteContainer.addChild(spriteRender.container);
      console.log('rs:a::added', entity.id);
    }
  }

  removed(entity: Entity) {
    const spriteRender = this.ecs.getComponent(entity, Renderable);
    if (is_some(spriteRender)) {
      this.spriteContainer.removeChild(spriteRender.container);
      console.log('rs:r::removed', entity.id);
    }
  }

  process(_: Entity, query: Query<typeof this.needed>) {
    const [renderable, position, rotation] = query.retrieve();

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
