import { Bag, Entity, EntitySystem, EntitySystemArgs, Query } from 'ecsf';
import { Position, CameraData, CameraFocus } from 'components';
import { Application } from 'pixi.js';
import { is_none, is_some } from 'utils';

interface CSProps {
  app: Application;
}

export class CameraSystem extends EntitySystem<
  [typeof Position, typeof CameraFocus],
  CSProps
> {
  camera!: Entity;
  app: Application;
  constructor(props: EntitySystemArgs) {
    super({
      ...props,
      needed: [Position, CameraFocus],
      app: props.app,
    });
    this.app = props.app;
  }

  load(_entities: Bag<Entity>) {
    const maybeCamera = this.ecs.getEntityByTag('camera');
    if (!is_some(maybeCamera)) return;
    this.camera = maybeCamera;
    const maybeData = this.ecs.getComponentOfType(maybeCamera, CameraData);
    if (is_none(maybeData)) return;
    this.app.stage.addChild(maybeData.view);
  }

  process(_: Entity, query: Query<typeof this.needed>) {
    const [position, _focus] = query.retrieve();
    const cameraData = this.ecs.getComponent(this.camera, CameraData);
    if (is_none(cameraData)) return;
    cameraData.view.pivot.set(position.value.x, position.value.y);
  }
}
