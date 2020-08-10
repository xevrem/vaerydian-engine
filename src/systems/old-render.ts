import { ComponentMapper, Entity, EntitySystem } from '../ecsf';
import { GraphicsRender, Position } from '../components';

export class GraphicsRenderSystem extends EntitySystem {
  app: PIXI.Application;
  graphicsContainer: PIXI.Container;
  renderMap: ComponentMapper;
  positionMap: ComponentMapper;

  constructor(app: PIXI.Application) {
    super();
    this.app = app;
  }

  initialize() {
    console.log('render system initializing...');
    this.renderMap = new ComponentMapper(
      new GraphicsRender(),
      this.ecsInstance
    );
    this.positionMap = new ComponentMapper(new Position(), this.ecsInstance);
    this.graphicsContainer = new PIXI.Container();
    this.app.stage.addChild(this.graphicsContainer);
  }

  added(entity: Entity) {
    this.graphicsContainer.addChild(
      (<GraphicsRender>this.renderMap.get(entity)).graphics
    );
  }

  process(entity: Entity) {
    const render = this.renderMap.get(entity) as GraphicsRender;
    const position = this.positionMap.get(entity) as Position;

    render.graphics.position.set(position.point.x, position.point.y);
  }
}
