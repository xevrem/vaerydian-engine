import { EntitySystem, Entity, EntitySystemArgs } from 'ecsf';
import { Group } from '@pixi/layers';
import { Layers, Scene } from '../components';
// import { LayerType } from '../utils/constants';
import { is_some } from 'onsreo';

type Props = { groups: Map<number, Group> };
type Needed = [typeof Layers, typeof Scene];

export class LayeringSystem extends EntitySystem<Props, Needed> {
  groups: Map<number, Group>;
  // playerGroup!: Group;
  // starfieldGroup!: Group;

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
    // this.playerGroup = this.groups[LayerType.player];
    // this.starfieldGroup = this.groups[LayerType.starfield];
    // this.starfieldGroup = this.groups[LayerType.starfield];
  }

  added(_entity: Entity) {
    const [layers, scene] = this.query.retrieve();
    const group = this.groups.get(layers.value);
    if (is_some(group)) scene.asset.parentGroup = group;
  }

  removed(_entity: Entity) {}
}
