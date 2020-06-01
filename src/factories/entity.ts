import { EcsInstance } from "ecsf";
import { Point, Graphics } from "pixi.js";

import { Position, Renderable, Velocity } from "../components";

export class EntityFactory {
  ecsInstance: EcsInstance;

  constructor(ecsInstance: EcsInstance) {
    this.ecsInstance = ecsInstance;
  }

  createGraphic() {
    let entity = this.ecsInstance.create();

    const position = new Position(new Point(Math.random() * window.innerWidth, Math.random() * window.innerHeight));
    this.ecsInstance.addComponent(entity, position);

    const velocity = new Velocity(new Point(Math.random() * 2 - 1, Math.random() * 2 - 1));
    this.ecsInstance.addComponent(entity, velocity);

    const renderable = new Renderable(new Graphics().beginFill(0x5555ff).drawCircle(0, 0, 2).endFill());
    this.ecsInstance.addComponent(entity, renderable);

    this.ecsInstance.resolve(entity);
  }
}
