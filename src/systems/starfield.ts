import { EntitySystem, Entity } from "../ecsf";


export class StarfieldSystem extends EntitySystem {
  app: PIXI.Application;
  constructor(app: PIXI.Application){
    super();
    this.app = app;
  }

  initialize(){
    
  }

  process(entity: Entity){
    
  }
}
