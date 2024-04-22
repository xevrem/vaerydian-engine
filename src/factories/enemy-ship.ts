import { EcsInstance } from 'ecsf';
import { create_executor_builder, sel, seq } from 'behavey';
import { Vector2 } from 'evjkit';
import { Assets, Container, Sprite, Texture } from 'pixi.js';
import {
  Animatable,
  Behavior,
  Heading,
  Layers,
  Position,
  Resource,
  Rotation,
  Scene,
  Velocity,
} from 'src/components';
import { animationBuilder } from 'src/utils/animation';
import { Engine } from 'src/engine';
import { LayerType } from 'src/utils/constants';

export function create_enemy_ship(ecs: EcsInstance, location: Vector2) {
  const entity = ecs
    .create()
    .addWith(() => {
      const container = new Container();
      const texture = Assets.get<Texture>('playerShip');
      const shipSprite = new Sprite(texture);
      container.addChild(shipSprite);
      const scene = new Scene();
      scene.asset = container;
      scene.offset = Vector2.zero;
      scene.pivot = new Vector2(12, 12);
      return scene;
    })
    .addWith(() => {
      const l = new Layers();
      l.value = LayerType.sprites;
      return l;
    })
    .addWith(() => {
      const position = new Position();
      position.value = location;
      return position;
    })
    .addWith(() => {
      const rotation = new Rotation();
      rotation.value = 0;
      return rotation;
    })
    .addWith(() => {
      const velocity = new Velocity();
      velocity.vector = Vector2.zero;
      velocity.rate = 5;
      return velocity;
    })
    .addWith(() => {
      const heading = new Heading();
      heading.value = Vector2.identity;
      return heading;
    })
    // .addWith(_builder => {
    //   const anim = new Animatable();
    //   anim.value = animationBuilder([Scene]).build();
    //   return anim;
    // })
    // .addWith(_builder => {
    //   const exec = create_executor_builder<EcsInstance>()
    //     .create_major_mode(mode =>
    //       mode
    //         .set_name('foo')
    //         .create_tree(tree =>
    //           tree
    //             .set_root(
    //               sel(
    //                 seq(args => {
    //                   const engineResource = args.meta.getComponentByTag(
    //                     'engine',
    //                     Resource<Engine>,
    //                   );
    //                   if (!engineResource) return false;
    //                   engineResource.value;
    //                   return true;
    //                 }),
    //               ),
    //             )
    //             .build(),
    //         )
    //         .build(),
    //     )
    //     .build();
    //   const behavior = new Behavior<EcsInstance>();
    //   behavior.value = exec;
    //   return behavior;
    // })
    .tag('enemy')
    .group('enemies')
    .build();

  console.log('enemy result:', entity);
}
