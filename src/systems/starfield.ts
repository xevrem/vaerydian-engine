import { EntitySystem, Entity, ComponentMapper } from '../ecsf';
import { Position, Velocity } from '../components';
import { Vector } from '../utils/vector';

export class StarfieldSystem extends EntitySystem {
  app: PIXI.Application;
  player: Entity;
  positionMap: ComponentMapper;
  velocityMap: ComponentMapper;
  distance: number;

  constructor(app: PIXI.Application) {
    super();
    this.app = app;
  }

  initialize(): void {
    console.log('starfield system initializing...');
    this.positionMap = new ComponentMapper(new Position(), this.ecsInstance);
    this.velocityMap = new ComponentMapper(new Velocity(), this.ecsInstance);
    this.distance = window.innerWidth/ 1.14;
  }

  preLoadContent(): void {
    this.player = this.ecsInstance.tagManager.getEntityByTag('player');
  }

  process(entity: Entity): void {
    const position = this.positionMap.get(entity) as Position;
    const playerPos = this.positionMap.get(this.player) as Position;
    const playerVel = this.velocityMap.get(this.player) as Velocity;
    const distance = Vector.distance(position.point, playerPos.point);
    if (distance > this.distance) {
      const angle = Math.random() * 180 - 90;
      const projVec = Vector.normalize(
        Vector.rotateVectorDegrees(playerVel.vector, angle)
      );
      const projPos = Vector.multScalar(projVec, this.distance - Math.random() * 200);
      position.point = Vector.add(playerPos.point,projPos);
    }
  }
}
