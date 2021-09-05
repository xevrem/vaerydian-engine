import { EntitySystem, Entity, ComponentMapper } from "../ecsf";
import { Layers, Renderable, GraphicsRender } from "../components";
import { LayerType } from "../utils/constants";
import { Application } from "@pixi/app";
import { Group, Layer } from "@pixi/layers";
import { DisplayObject } from "@pixi/display";


export class LayeringSystem extends EntitySystem {
  app: Application;
  graphicsMapper: ComponentMapper;
  layerMapper: ComponentMapper;
  playerGroup: Group;
  renderMapper: ComponentMapper;
  starfieldGroup: Group;

  constructor(app: Application){
    super();
    this.app = app;
  }

  initialize(){
    this.layerMapper = new ComponentMapper(new Layers(), this.ecsInstance);
    this.renderMapper = new ComponentMapper(new Renderable(), this.ecsInstance);
    this.graphicsMapper = new ComponentMapper(new GraphicsRender(), this.ecsInstance);
    this.playerGroup = new Group(LayerType.player, false);
    this.starfieldGroup = new Group(LayerType.starfield, false);
    this.app.stage.addChild(new Layer(this.starfieldGroup));
    this.app.stage.addChild(new Layer(this.playerGroup));
  }

  getDisplayObject(entity: Entity): DisplayObject {
    const renderable = this.renderMapper.get(entity) as Renderable;
    if(renderable) return renderable.container;

    const graphics = this.graphicsMapper.get(entity) as GraphicsRender;
    if(graphics) return graphics.graphics;

    return null;
  }

  added(entity: Entity ){
    const layer = this.layerMapper.get(entity) as Layers;
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

  removed(_entity: Entity){
  }
}
