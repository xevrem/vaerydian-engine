import { EntitySystem, Entity, ComponentMapper } from "../ecsf";
import { Layer, Renderable, GraphicsRender } from "../components";
import { LayerType } from "../utils/constants";


export class LayeringSystem extends EntitySystem {
  app: PIXI.Application;
  graphicsMapper: ComponentMapper;
  layerMapper: ComponentMapper;
  playerGroup: PIXI.display.Group;
  renderMapper: ComponentMapper;
  starfieldGroup: PIXI.display.Group;

  constructor(app: PIXI.Application){
    super();
    this.app = app;
  }

  initialize(){
    this.layerMapper = new ComponentMapper(new Layer(), this.ecsInstance);
    this.renderMapper = new ComponentMapper(new Renderable(), this.ecsInstance);
    this.graphicsMapper = new ComponentMapper(new GraphicsRender(), this.ecsInstance);
    this.playerGroup = new PIXI.display.Group(LayerType.player, false);
    this.starfieldGroup = new PIXI.display.Group(LayerType.starfield, false);
    this.app.stage.addChild(new PIXI.display.Layer(this.starfieldGroup));
    this.app.stage.addChild(new PIXI.display.Layer(this.playerGroup));
  }

  getDisplayObject(entity: Entity): PIXI.DisplayObject {
    const renderable = this.renderMapper.get(entity) as Renderable;
    if(renderable) return renderable.container;

    const graphics = this.graphicsMapper.get(entity) as GraphicsRender;
    if(graphics) return graphics.graphics;

    return null;
  }

  added(entity: Entity ){
    const layer = this.layerMapper.get(entity) as Layer;
    const displayObject = this.getDisplayObject(entity);
    if(null) return;

    switch(layer.layer){
      case LayerType.player:{
        displayObject.parentGroup = this.playerGroup;
        break;
      }
      case LayerType.starfield:{
        displayObject.parentGroup = this.starfieldGroup;
      }
      default:
        break;
    }
  }

  removed(entity: Entity){
  }
}
