import {EcsInstance} from 'ecsf';

export class Engine {
  ecsInstance: EcsInstance;

  constructor(){
    this.ecsInstance = new EcsInstance();
  }

  initialize() {
    console.log('initialize');
    window.ecsInstance = this.ecsInstance;
  }

  load() {
    console.log('load');
  }

  run() {
    console.log('run');
  }

  update() { }

  draw() { }
}
