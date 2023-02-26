import { EntitySystem, Entity, EntitySystemArgs, Query } from 'ecsf';
import { Scene, Position, Rotation } from 'components';
import { Application, Container } from 'pixi.js';

export class RenderSystem extends EntitySystem<
  [typeof Scene, typeof Position, typeof Rotation],
  { app: Application }
> {
  app: Application;
  spriteContainer!: Container;

  constructor(props: EntitySystemArgs) {
    super({
      ...props,
      needed: [Scene, Position, Rotation],
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
    this.spriteContainer.addChild(renderer.asset);
  }

  deleted(entity: Entity) {
    const [renderer] = this.query.retrieve();
    this.spriteContainer.removeChild(renderer.asset);
  }

  added(entity: Entity) {
    const [renderer] = this.query.retrieve();
    this.spriteContainer.addChild(renderer.asset);
  }

  removed(entity: Entity) {
    const [renderer] = this.query.retrieve();
    this.spriteContainer.removeChild(renderer.asset);
  }

  process(_: Entity, query: Query<typeof this.needed>) {
    const [renderable, position, rotation] = query.retrieve();

    renderable.asset.position.set(
      position.value.x - renderable.offset.x,
      position.value.y - renderable.offset.y
    );

    renderable.asset.pivot.set(renderable.pivot.x, renderable.pivot.y);

    renderable.asset.angle = rotation
      ? rotation.value
      : renderable.asset.angle;
  }
}
