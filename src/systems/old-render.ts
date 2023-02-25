import { Entity, EntitySystem, EntitySystemArgs, Query } from '../ecsf';
import { GraphicsRender, Position } from '../components';
import { Application, Container } from 'pixi.js';
import { all_some, is_some } from 'utils/helpers';

export class GraphicsRenderSystem extends EntitySystem<
  [typeof GraphicsRender, typeof Position],
  { app: Application }
> {
  app: Application;
  graphicsContainer!: Container;

  constructor(props: EntitySystemArgs) {
    super({
      ...props,
      needed: [GraphicsRender, Position],
      app: props.app,
    });
    this.app = props.app;
  }

  initialize() {
    console.info('render system initializing...');
    this.graphicsContainer = new Container();
    this.app.stage.addChild(this.graphicsContainer);
  }

  added(entity: Entity) {
    const maybeGraphics = this.ecs.getComponent(entity, GraphicsRender);
    if (!is_some(maybeGraphics)) return;
    this.graphicsContainer.addChild(maybeGraphics.graphics);
  }

  removed(entity: Entity): void {
    const maybeGraphics = this.ecs.getComponent(entity, GraphicsRender);
    if (!is_some(maybeGraphics)) return;
    this.graphicsContainer.removeChild(maybeGraphics.graphics);
  }

  process(_entity: Entity, query: Query<typeof this.needed>) {
    const results = query.retrieve();
    if (!all_some(results)) return;
    const [render, position] = results;
    render.graphics.position.set(position.value.x, position.value.y);
  }
}
