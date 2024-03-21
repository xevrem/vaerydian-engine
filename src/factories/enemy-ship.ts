import { EcsInstance } from 'ecsf';
import { create_executor_builder } from 'behavey';
import { Vector2 } from 'evjkit';
import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { Animatable, Behavior, Scene } from '../components';
import { animationBuilder } from '../utils/animation';

export function create_enemy_ship(ecs: EcsInstance, location: Vector2) {
  ecs
    .create()
    .addWith(() => {
      const scene = new Scene();
      scene.asset = new Container();
      scene.asset.addChild(new Sprite(Assets.get<Texture>('playerShip')));
      scene.asset.position.set(location.x, location.y);
      return scene;
    })
    .addWith(_builder => {
      const anim = new Animatable();
      anim.value = animationBuilder([Scene]).build();
      return anim;
    })
    .addWith(_builder => {
      const exec = create_executor_builder<EcsInstance>().build();
      const behavior = new Behavior<EcsInstance>();
      behavior.value = exec;
      return behavior;
    })
    .group('enemy')
    .build();
}
