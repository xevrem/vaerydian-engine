import {
  EntitySystem,
  Entity,
  ComponentMapper,
  EntitySystemArgs,
  Query,
} from 'ecsf';
import { Layers, Renderable, GraphicsRender } from 'components';
import { LayerType } from 'utils/constants';
import { DisplayObject } from 'pixi.js';
import { Group } from '@pixi/layers';

export class LayeringSystem extends EntitySystem<
  [typeof Layers],
  { groups: Record<string, Group> },
  [typeof Renderable, typeof GraphicsRender]
> {
  groups: Record<string, Group>;
  // graphicsMapper!: ComponentMapper;
  // layerMapper!: ComponentMapper;
  playerGroup!: Group;
  // renderMapper!: ComponentMapper;
  starfieldGroup!: Group;

  constructor(props: EntitySystemArgs) {
    super({
      ...props,
      needed: [Layers],
      optional: [Renderable, GraphicsRender],
      groups: props.groups,
    });
    this.groups = props.groups;
  }

  initialize() {
    // this.layerMapper = new ComponentMapper(new Layers(), this.ecsInstance);
    // this.renderMapper = new ComponentMapper(new Renderable(), this.ecsInstance);
    // this.graphicsMapper = new ComponentMapper(
    //   new GraphicsRender(),
    //   this.ecsInstance
    // );
    this.playerGroup = this.groups[LayerType.player];
    this.starfieldGroup = this.groups[LayerType.starfield];
  }

  // getDisplayObject(entity: Entity): DisplayObject {
  //   const renderable = this.renderMapper.get(entity) as Renderable;
  //   if (renderable) return renderable.container;

  //   const graphics = this.graphicsMapper.get(entity) as GraphicsRender;
  //   return graphics.graphics;
  // }

  added(entity: Entity) {
    const [layers, renderable, graphics] = this.ecs.retrieve<
      typeof this.needed,
      typeof this.optional
    >(entity, [Layers, Renderable, GraphicsRender]);

    if (renderable) {
      renderable.container.parentGroup = this.groups[layers.layer];
    }else if (graphics){
      graphics.graphics.parentGroup = this.groups[layers.layer];
    }
    // const layer = this.layerMapper.get(entity) as Layers;
    // const displayObject = this.getDisplayObject(entity);
    // if (null) return;
    // displayObject.parentGroup = this.groups[layer.layer];
  }

  removed(_entity: Entity) {}
}
