import { EntitySystem, Entity, EntitySystemArgs } from 'ecsf';
import { Layers, Scene } from 'components';
import { LayerType } from 'utils/constants';
import { Group } from '@pixi/layers';

type Props =   { groups: Record<string, Group> }
type Needed =   [typeof Layers, typeof Scene];


export class LayeringSystem extends EntitySystem<
  Props,
  Needed
> {
  groups: Record<string, Group>;
  playerGroup!: Group;
  starfieldGroup!: Group;

  constructor(props: EntitySystemArgs<Props, Needed>) {
    super({
      ...props,
      needed: [Layers, Scene],
      groups: props.groups,
    });
    this.groups = props.groups;
  }

  initialize() {
    console.info('layer system initialized...');
    this.playerGroup = this.groups[LayerType.player];
    this.starfieldGroup = this.groups[LayerType.starfield];
  }

  added(_entity: Entity) {
    const [layers, scene] = this.query.retrieve();
    scene.asset.parentGroup = this.groups[layers.value];
  }

  removed(_entity: Entity) {}
}
