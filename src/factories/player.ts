import {
  Assets,
  Container,
  Sprite,
  Texture,
  Transform as PTransform,
} from 'pixi.js';
import {
  Behavior,
  CameraFocus,
  Controllable,
  Heading,
  Layers,
  Player,
  Position,
  Scene,
  Rotation,
  Transform,
  Velocity,
} from '../components';
import { EcsInstance } from 'ecsf';
import { LayerType } from 'utils/constants';
import { Vector2 } from 'utils/vector';
import { ExecutorBuilder, sel } from 'behavey';
// import { Behavior } from 'behave/behavior';

export class PlayerFactory {
  ecsInstance: EcsInstance;

  constructor(ecsInstance: EcsInstance) {
    this.ecsInstance = ecsInstance;
  }

  createPlayer(location: Vector2): void {
    this.ecsInstance
      .create()
      .addWith(() => {
        const p = new Position();
        p.value = location;
        return p;
      })
      .addWith(() => {
        const v = new Velocity();
        v.vector = Vector2.zero;
        v.rate = 5;
        return v;
      })
      .addWith(() => {
        const r = new Rotation();
        r.value = 0;
        r.offset = Math.PI / 2;
        r.rate = Math.PI / 2;
        return r;
      })
      .addWith(() => {
        const h = new Heading();
        h.value = new Vector2(1, 0); // 0 degrees
        return h;
      })
      .addWith(() => {
        const playerContainer = new Container();
        const texture = Assets.get<Texture>('playerShip');
        const shipSprite = new Sprite(texture);
        playerContainer.addChild(shipSprite);
        const r = new Scene();
        r.asset = playerContainer;
        r.offset = Vector2.zero;
        r.pivot = new Vector2(12, 12);
        return r;
      })
      .addWith(() => {
        const l = new Layers();
        l.value = LayerType.player;
        return l;
      })
      .addWith(() => {
        const trans = new Transform();
        trans.value = new PTransform();
        return trans;
      })
      .add(new Controllable())
      .add(new CameraFocus())
      .add(new Player())
      .addWith(() => {
        const exec = new ExecutorBuilder<EcsInstance, any>()
          .create_major_mode(major =>
            major
              .create_tree(tree =>
                tree
                  .set_root(
                    sel(
                      () => false,
                      _args => {
                        // console.log(`entities: ${args.meta.entityManager.entities.count}`);
                        return true;
                      },
                    ),
                  )
                  .build(),
              )
              .set_name('idle')
              .build(),
          )
          .set_default_mode('idle')
          .build();
        exec.init();

        const behavior = new Behavior<EcsInstance, any>();
        behavior.value = exec;

        return behavior;
      })
      .tag('player')
      .build();
  }
}
