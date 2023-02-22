import { Entity, EntitySystem, EntitySystemArgs, Query } from '../ecsf';
import { Position, Velocity, CameraData, CameraFocus } from '../components';
import { Application } from '@pixi/app';
import { all_some, is_none, is_some } from 'utils';

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

  load() {
    const maybeCamera = this.ecs.getEntityByTag('camera');
    if (!is_some(maybeCamera)) return;
    this.camera = maybeCamera;
    const maybeData = this.ecs.getComponentOfType(maybeCamera, CameraData);
    if (is_none(maybeData)) return;
    this.app.stage.addChild(maybeData.view);
  }

  // override end() {
  //   const maybeCamera = this.ecsInstance.getEntityByTag('camera');
  //   if (!is_some(maybeCamera)) return;
  //   this.camera = maybeCamera;
  //   const maybeData = this.ecs.getComponentOfType(maybeCamera, CameraData);
  //   if (is_none(maybeData)) return;
  //   this.app.renderer.render(this.app.stage, {
  //     transform: maybeData.view.localTransform,
  //   });
  // }

  process(
    _: Entity,
    query: Query<typeof this.needed>,
  ) {
    const results = query.retrieve();
    if (!all_some(results)) return;
    const [position, _focus] = results;
    const cameraData = this.ecs.getComponent(this.camera, CameraData);
    if (is_none(cameraData)) return;
    cameraData.view.pivot.set(position.point.x, position.point.y);
  }
}
