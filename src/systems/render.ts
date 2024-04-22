import { EntitySystem, Entity, EntitySystemArgs, Query } from 'ecsf';
import { Application, Container } from 'pixi.js';
import { Scene, Position, Rotation } from 'src/components';

type Props = { app: Application };

type Needed = [typeof Scene, typeof Position, typeof Rotation];

export class RenderSystem extends EntitySystem<Props, Needed> {
  app: Application;
  spriteContainer!: Container;

  constructor(props: EntitySystemArgs<Props, Needed>) {
    super({
      ...props,
      needed: [Scene, Position, Rotation],
      app: props.app,
    });
    this.app = props.app;

    this.spriteContainer = new Container();
  }

  initialize() {
    console.info('sprite system initializing...');
    this.app.stage.addChild(this.spriteContainer);
  }

  created(entity: Entity): void {
    const [scene] = this.query.retrieve();
    this.spriteContainer.addChild(scene.asset);
  }

  deleted(entity: Entity) {
    const [scene] = this.query.retrieve();
    this.spriteContainer.removeChild(scene.asset);
  }

  added(entity: Entity) {
    const [scene] = this.query.retrieve();
    this.spriteContainer.addChild(scene.asset);
  }

  removed(entity: Entity) {
    const [scene] = this.query.retrieve();
    this.spriteContainer.removeChild(scene.asset);
  }

  process(_: Entity, query: Query<typeof this.needed>) {
    const [scene, position, rotation] = query.retrieve();

    scene.asset.position.set(
      position.value.x - scene.offset.x,
      position.value.y - scene.offset.y
    );

    scene.asset.pivot.set(scene.pivot.x, scene.pivot.y);

    scene.asset.angle = rotation ? rotation.value : scene.asset.angle;
  }
}
