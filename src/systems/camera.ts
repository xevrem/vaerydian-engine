import { EntitySystem, ComponentMapper } from "../ecsf";
import { Position, Velocity } from "../components";


export class CameraSystem extends EntitySystem {
  positionMap: ComponentMapper;
  velocityMap: ComponentMapper;
  camera: Entity;

  initialize() {
    console.log('camera system initializing...');
    this.positionMap = new ComponentMapper(new Position(), this.ecsInstance);
    this.velocityMap = new ComponentMapper(new Velocity(), this.ecsInstance);
  }

  preLoadContent(){
    this.camera = this.ecsInstance.tagManager.getEntityByTag('camera');
  }

  process(entity: Entity, delta:number){
    
  }
}
