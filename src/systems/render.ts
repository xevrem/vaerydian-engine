import { ComponentMapper, Entity, EntitySystem } from '../ecsf';
import { Application } from 'pixi.js';
import { Renderable, Position } from '../components';


export class GraphicsRenderSystem extends EntitySystem {
  app: Application;
  renderMap: ComponentMapper;
  positionMap: ComponentMapper;

  constructor(app: Application) {
    super();
    this.app = app;
  }

  initialize() {
    console.log('render system initializing...')
    this.renderMap = new ComponentMapper(new Renderable(), this.ecsInstance);
    this.positionMap = new ComponentMapper(new Position(), this.ecsInstance);
  }

  added(entity: Entity) {
    this.app.stage.addChild((<Renderable>this.renderMap.get(entity)).graphics);
  }

  process(entity: Entity) {
    const render = this.renderMap.get(entity) as Renderable;
    const position = this.positionMap.get(entity) as Position;

    render.graphics.position.set(position.point.x, position.point.y);
  }
}
