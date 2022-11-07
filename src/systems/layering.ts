import { EntitySystem, Entity, ComponentMapper } from 'ecsf';
import { Layers, Renderable, GraphicsRender } from 'components';
import { LayerType } from 'utils/constants';
import { Application, DisplayObject } from 'pixi.js';
import { Group, Layer } from '@pixi/layers';

export class LayeringSystem extends EntitySystem {
  app: Application;
  graphicsMapper!: ComponentMapper;
  layerMapper!: ComponentMapper;
  playerGroup!: Group;
  renderMapper!: ComponentMapper;
  starfieldGroup!: Group;

  constructor(app: Application) {
    super();
    this.app = app;
  }

  initialize() {
    this.layerMapper = new ComponentMapper(new Layers(), this.ecsInstance);
    this.renderMapper = new ComponentMapper(new Renderable(), this.ecsInstance);
    this.graphicsMapper = new ComponentMapper(
      new GraphicsRender(),
      this.ecsInstance
    );
    this.playerGroup = new Group(LayerType.player, true);
    this.starfieldGroup = new Group(LayerType.starfield, true);
    this.app.stage.addChild(new Layer(this.starfieldGroup));
    this.app.stage.addChild(new Layer(this.playerGroup));
  }

  getDisplayObject(entity: Entity): DisplayObject {
    const renderable = this.renderMapper.get(entity) as Renderable;
    if (renderable) return renderable.container;

    const graphics = this.graphicsMapper.get(entity) as GraphicsRender;
    return graphics.graphics;
  }

  added(entity: Entity) {
    const layer = this.layerMapper.get(entity) as Layers;
    const displayObject = this.getDisplayObject(entity);
    if (null) return;

    switch (layer.layer) {
      case LayerType.player: {
        displayObject.parentGroup = this.playerGroup;
        break;
      }
      case LayerType.starfield: {
        displayObject.parentGroup = this.starfieldGroup;
        break;
      }
      default:
        break;
    }
  }

  removed(_entity: Entity) {}
}
