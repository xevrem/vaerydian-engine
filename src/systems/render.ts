import { EntitySystem, Entity, EntitySystemArgs, Query } from 'ecsf';
import { Renderable, Position, Rotation } from 'components';
import { Application, Container } from 'pixi.js';

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

    this.spriteContainer = new Container();
  }

  initialize() {
    console.info('sprite system initializing...');
    this.app.stage.addChild(this.spriteContainer);
  }

  created(entity: Entity): void {
    const [renderer] = this.query.retrieve();
    this.spriteContainer.addChild(renderer.container);
  }

  deleted(entity: Entity) {
    const [renderer] = this.query.retrieve();
    this.spriteContainer.removeChild(renderer.container);
  }

  added(entity: Entity) {
    const [renderer] = this.query.retrieve();
    this.spriteContainer.addChild(renderer.container);
  }

  removed(entity: Entity) {
    const [renderer] = this.query.retrieve();
    this.spriteContainer.removeChild(renderer.container);
  }

  process(_: Entity, query: Query<typeof this.needed>) {
    const [renderable, position, rotation] = query.retrieve();

    renderable.container.position.set(
      position.value.x - renderable.offset.x,
      position.value.y - renderable.offset.y
    );

    renderable.container.pivot.set(renderable.pivot.x, renderable.pivot.y);

    renderable.container.angle = rotation
      ? rotation.amount
      : renderable.container.angle;
  }
}
