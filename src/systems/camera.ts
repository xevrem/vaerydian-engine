import { Bag, Entity, EntitySystem, EntitySystemArgs, Query } from 'ecsf';
import { is_none } from 'onsreo';
import { Application } from 'pixi.js';
import { Position, Scene, CameraFocus } from 'components';

interface CSProps {
  app: Application;
}

type Needed = [typeof Position, typeof CameraFocus];

export class CameraSystem extends EntitySystem<CSProps, Needed> {
  camera!: Entity;
  app: Application;
  constructor(props: EntitySystemArgs<CSProps, Needed>) {
    super({
      ...props,
      needed: [Position, CameraFocus],
      app: props.app,
    });
    this.app = props.app;
  }

  load(_entities: Bag<Entity>) {
    const maybeCamera = this.ecs.getEntityByTag('camera');
    if (is_none(maybeCamera)) return;
    this.camera = maybeCamera;
    const maybeData = this.ecs.getComponentOfType(maybeCamera, Scene);
    if (is_none(maybeData)) return;
    this.app.stage.addChild(maybeData.asset);
  }

  process(_: Entity, query: Query<typeof this.needed>) {
    const [position, _focus] = query.retrieve();
    const cameraData = this.ecs.getComponent(this.camera, Scene);
    if (is_none(cameraData)) return;
    cameraData.asset.pivot.set(position.value.x, position.value.y);
  }
}
