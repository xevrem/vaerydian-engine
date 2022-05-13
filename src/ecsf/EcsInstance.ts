import { EntityManager } from './EntityManager';
import { ComponentManager } from './ComponentManager';
import { SystemManager } from './SystemManager';
import { TagManager } from './TagManager';
import { GroupManager } from './GroupManager';
import { Entity } from './Entity';
import { Component } from './Component';
import { ComponentMapper } from './ComponentMapper';
import {
  ComponentTuple,
  Query,
  QueryFunc,
  QueryResult,
  VariadricQuery,
} from '.';

export class EcsInstance {
  entityManager: EntityManager;
  componentManager: ComponentManager;
  systemManager: SystemManager;
  tagManager: TagManager;
  groupManager: GroupManager;

  private __updating: Array<Entity>;
  private __deleting: Array<Entity>;
  private __delta: number;
  private __lastTime: number;
  private __elapsed: number;

  constructor() {
    this.entityManager = new EntityManager();
    this.componentManager = new ComponentManager(this);
    this.systemManager = new SystemManager(this);
    this.tagManager = new TagManager();
    this.groupManager = new GroupManager();
    this.__updating = [];
    this.__deleting = [];
    this.__delta = 0;
    this.__lastTime = 0;
    this.__elapsed = 0;
  }

  get delta(): number {
    return this.__delta;
  }

  get elapsed(): number {
    return this.__elapsed;
  }

  create(): Entity {
    return this.entityManager.create();
  }

  addComponent(entity: Entity, component: Component): void {
    this.componentManager.addComponent(entity, component);
  }

  removeComponent(component: Component): void {
    this.componentManager.removeComponent(component);
  }

  hasComponent(entity: Entity, type: number): boolean {
    return this.componentManager.hasComponent(entity, type);
  }

  makeMapper(component: Component): ComponentMapper {
    return new ComponentMapper(component, this);
  }

  resolve(entity: Entity): void {
    if (entity) this.__updating.push(entity);
  }

  deleteEntity(entity: Entity): void {
    if (entity) this.__deleting.push(entity);
  }

  resolveEntities(): void {
    if (this.__updating.length > 0) {
      this.__updating.forEach(entity => this.systemManager.resolve(entity));
      this.__updating = [];
    }

    if (this.__deleting.length > 0) {
      this.__deleting.forEach(entity => {
        this.systemManager.deleteEntity(entity);
        this.tagManager.deleteEntity(entity);
        this.groupManager.deleteEntity(entity);
        this.componentManager.deleteEntity(entity);
        this.entityManager.deleteEntity(entity);
      });
      this.__deleting = [];
    }
  }

  updateTime(time: number): void {
    this.__delta = time - this.__lastTime;
    this.__elapsed += this.__delta;
    this.__lastTime = time;
  }

  updateByDelta(delta: number): void {
    this.__delta = delta;
    this.__elapsed += this.__delta;
    this.__lastTime = performance.now();
  }

  cleanUp(): void {
    this.entityManager.cleanUp();
    this.componentManager.cleanUp();
    this.systemManager.cleanUp();
    this.groupManager.cleanUp();
    this.tagManager.cleanUp();
  }

  *query<T extends ComponentTuple>(
    needed: VariadricQuery<T>
  ): IterableIterator<QueryResult<T>> {
    for (let i = this.entityManager.entities.length; i--; ) {
      const entity = this.entityManager.entities.get(i);
      if (!entity) continue;
      let valid = true;
      const result: any = [];
      for (let j = 0; j < needed.length; j++) {
        const components = this.componentManager.components.get(needed[j].type);
        if (components) {
          const component = components.get(i);
          valid = !!component && valid;
          if (!valid) break;
          result.push(component);
        }
      }
      if (valid) yield result;
    }
    return;
  }

  qSysTuple: [
    func: (query: Query<any>, ecs: EcsInstance) => void,
    data: VariadricQuery<ComponentTuple>
  ][] = [];

  withSystem<T extends ComponentTuple>(
    queryFunc: QueryFunc<T>, 
    data: [...T],
  ): void {
    this.qSysTuple.push([queryFunc, data]);
  }

  runQuerySystems(): void {
    for (let i = 0; i < this.qSysTuple.length; i++) {
      const [func, data] = this.qSysTuple[i];
      func(new Query(this, data), this);
    }
  }
}
