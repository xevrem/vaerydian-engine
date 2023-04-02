import { EcsInstance, Entity } from 'ecsf';
import {
  Position,
  Layers,
  Starfield,
  Scene,
  Rotation,
  Animatable,
} from 'components';
import { LayerType, STARS } from 'utils/constants';
import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { Vector2 } from 'utils/vector';
import { animationBuilder } from 'utils/animation';

export class EntityFactory {
  ecsInstance: EcsInstance;

  constructor(ecsInstance: EcsInstance) {
    this.ecsInstance = ecsInstance;
  }

  createStar(location?: Vector2): Result<Entity> {
    return this.ecsInstance
      .create()
      .addWith(() => {
        const position = new Position();
        position.value = location
          ? location
          : new Vector2(
              (Math.random() * 2 - 1) * window.innerWidth,
              (Math.random() * 2 - 1) * window.innerHeight
            );
        return position;
      })
      .addWith(() => {
        const spriteName = STARS[Math.floor(Math.random() * STARS.length)];
        const starContainer = new Container();
        const texture = Assets.get<Texture>(spriteName);
        const starSprite = new Sprite(texture);
        starContainer.addChild(starSprite);
        const renderable = new Scene();
        renderable.asset = starContainer;
        renderable.offset = new Vector2(4, 4);
        renderable.pivot = new Vector2(2, 2);
        return renderable;
      })
      .addWith(() => {
        const rot = new Rotation();
        rot.value = Math.random() * 180;
        rot.rate = 0;
        return rot;
      })
      .addWith(() => {
        const layers = new Layers();
        layers.value = LayerType.starfield;
        return layers;
      })
      .add(new Starfield())
      .build();
  }

  createCamera(): void {
    this.ecsInstance
      .create()
      .addWith(() => {
        const position = new Position();
        position.value = new Vector2(
          window.innerWidth / 2,
          window.innerHeight / 2
        );
        return position;
      })
      // .addWith(() => {
      //   const velocity = new Velocity();
      //   velocity.vector = new Point(0, 0);
      //   velocity.rate = 0;
      //   return velocity;
      // })
      .addWith(() => {
        const cameraContainer = new Container();
        cameraContainer.pivot.set(
          window.innerWidth / 2,
          window.innerHeight / 2
        );
        cameraContainer.position.set(
          window.innerWidth / 2,
          window.innerHeight / 2
        );
        cameraContainer.scale.set(1280 / 640, 720 / 360);
        const cameraData = new Scene();
        cameraData.asset = cameraContainer;
        return cameraData;
      })
      .tag('camera')
      .build();
  }

  createAnim(target: Entity) {
    this.ecsInstance
      .create()
      .addWith(() => {
        const position = new Position();
        position.value = Vector2.zero;
        return position;
      })
      .addWith(() => {
        const animation = animationBuilder([Position, Rotation])
          .setTarget(target)
	  .repeats()
          // .addTrack(Position)
          // .repeats()
          // .startsAt(0)
          // .duration(2)
          // .keyFrame()
          // .atPercent(0.0)
          // .set('value')
          // .to(Vector2.zero)
          // .insert()
          // .keyFrame()
          // .atPercent(0.5)
          // .set('value')
          // .to(new Vector2(100, 100))
          // .insert()
          // .keyFrame()
          // .atPercent(1.0)
          // .set('value')
          // .to(Vector2.zero)
          // .insert()
          // .endTrack()
          .addTrack(Rotation)
	  .startsAt(0)
	  .repeats()
          .duration(6)
          .keyFrame()
	  .atTime(2)
          .set('value')
          .to(120)
          .insert()
          .keyFrame()
          .atTime(4)
          .set('value')
          .to(240)
          .insert()
          .keyFrame()
          .atTime(6)
          .set('value')
          .to(360)
          .insert()
          .endTrack()
          .build();

        const animatable = new Animatable();
        animatable.value = animation;
        return animatable;
      })
      // .tag('animation-test')
      .build();
  }
}
