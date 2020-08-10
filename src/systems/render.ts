import { EntitySystem, ComponentMapper, Entity } from '../ecsf';
import { Renderable, Position, Rotation } from '../components';

export class RenderSystem extends EntitySystem {
  app: PIXI.Application;
  spriteContainer: PIXI.Container;
  renderMapper: ComponentMapper;
  positionMapper: ComponentMapper;
  rotationMapper: ComponentMapper;

  constructor(app: PIXI.Application) {
    super();
    this.app = app;
  }

  initialize() {
    console.log('sprite system initializing...');
    this.renderMapper = new ComponentMapper(new Renderable(), this.ecsInstance);
    this.positionMapper = new ComponentMapper(new Position(), this.ecsInstance);
    this.rotationMapper = new ComponentMapper(new Rotation(), this.ecsInstance);
    this.spriteContainer = new PIXI.Container();
    this.app.stage.addChild(this.spriteContainer);
  }

  added(entity: Entity) {
    const spriteRender = this.renderMapper.get(entity) as Renderable;
    this.spriteContainer.addChild(spriteRender.container);
  }

  removed(entity: Entity) {
    const spriteRender = this.renderMapper.get(entity) as Renderable;
    this.spriteContainer.removeChild(spriteRender.container);
  }

  process(entity: Entity) {
    const renderable = this.renderMapper.get(entity) as Renderable;
    const position = this.positionMapper.get(entity) as Position;
    const rotation = this.rotationMapper.get(entity) as Rotation;

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
