import { Application } from "pixi.js";

import { EntitySystem, ComponentMapper, Entity } from "../ecsf";
import { SpriteRender, Position, Rotation } from "../components";



export class SpriteSystem extends EntitySystem {
  app: Application;
  spriteMapper: ComponentMapper;
  positionMapper: ComponentMapper;
  rotationMapper: ComponentMapper;

  constructor(app: Application){
    super();
    this.app = app;
  }

  initialize(){
    console.log('sprite system initializing...')
    this.spriteMapper = new ComponentMapper(new SpriteRender(), this.ecsInstance);
    this.positionMapper = new ComponentMapper(new Position(), this.ecsInstance);
    this.rotationMapper = new ComponentMapper(new  Rotation(), this.ecsInstance);
  }

  added(entity: Entity){
    const spriteRender = this.spriteMapper.get(entity) as SpriteRender;
    this.app.stage.addChild(spriteRender.sprite);
  }

  removed(entity: Entity){
    const spriteRender = this.spriteMapper.get(entity) as SpriteRender;
    this.app.stage.removeChild(spriteRender.sprite);
  }

  process(entity: Entity){
    const spriteRender = this.spriteMapper.get(entity) as SpriteRender;
    const position = this.positionMapper.get(entity) as Position;
    const rotation = this.rotationMapper.get(entity) as Rotation;

    spriteRender.sprite.position.set(
      position.point.x - spriteRender.offset.x,
      position.point.y - spriteRender.offset.y
    );

    spriteRender.sprite.anchor.set(
      spriteRender.anchor.x,
      spriteRender.anchor.y
    )

    spriteRender.sprite.angle = rotation.amount;
  }
}
