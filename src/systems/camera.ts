import {
  Entity,
  EntitySystem,
  EntitySystemArgs,
  Query,
} from '../ecsf';
import { Position, Velocity, CameraData, CameraFocus } from '../components';
import { Application } from '@pixi/app';
import { is_none, is_some } from 'utils';

interface CSProps {
  app: Application;
}

export class CameraSystem extends EntitySystem<CSProps> {
  camera!: Entity;
  app: Application;
  constructor(
    props: EntitySystemArgs<CSProps> = {
      needed: [CameraData, Position, Velocity, CameraFocus],
    }
  ) {
    super(props);
    this.app = props.app;
  }

  override load() {
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

  override process(cameraFocus: Entity, query: Query, _delta: number) {
    const focusPosition = query.get(cameraFocus, Position);
    // const cameraPosition = query.get(this.camera, Position);
    // cameraPosition.point.set(focusPosition.point.x, focusPosition.point.y);

    // this.camera = this.ecsInstance.tagManager.getEntityByTag('camera');
    const cameraData = query.get(this.camera, CameraData);
    if (is_none(cameraData)) return;
    cameraData.view.pivot.set(focusPosition.point.x, focusPosition.point.y);
    // this.ecs.update(cameraData);
  }

  override join(
    result: JoinResult<typeof this.needed, typeof this.optional>
  ): void {
    const foo = result;
  }
}
