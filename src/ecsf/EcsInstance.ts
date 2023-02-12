import { EntityManager } from './EntityManager';
import { ComponentManager } from './ComponentManager';
import { SystemManager, SystemRegistrationArgs } from './SystemManager';
import { TagManager } from './TagManager';
import { GroupManager } from './GroupManager';
import { Entity } from './Entity';
import { Component } from './Component';
import { ComponentMapper } from './ComponentMapper';
import { Scheduler } from './Scheduler';
import { EntitySystem, EntitySystemArgs } from './EntitySystem';
import { Bag } from './Bag';
import { RootReducer } from 'types/modules';
import { EntityBuilder, makeEntityBuilder } from './EntityBuilder';

export declare type ComponentTuple = typeof Component[];

export declare type OrderedTuple<T extends ComponentTuple = ComponentTuple> = {
  [P in keyof T]: T[P] extends new () => infer U ? U : undefined;
};

export declare type SmartUpdate = [component: Component, systems: boolean[]];

export class EcsInstance {
  entityManager: EntityManager;
  componentManager: ComponentManager;
  systemManager: SystemManager;
  tagManager: TagManager;
  groupManager: GroupManager;
  scheduler: Scheduler;

  private _creating: Bag<Entity>;
  private _resolving: Bag<[Entity, boolean[]]>;
  // IDEA: for when we introduce smart resolves
  // private _resolveAdd: Bag<Component[]>;
  // private _resolveRemove: Bag<Component[]>;
  private _deleting: Bag<Entity>;
  private _updatingEntities: Entity[];
  private _updating: Bag<Bag<SmartUpdate>>;
  private _delta: number;
  private _lastTime: number;
  private _elapsed: number;
  private _destroyed = false;

  constructor() {
    this.entityManager = new EntityManager();
    this.componentManager = new ComponentManager(this);
    this.systemManager = new SystemManager(this);
    this.tagManager = new TagManager();
    this.groupManager = new GroupManager();
    this.scheduler = new Scheduler();
    this._creating = new Bag<Entity>();
    // IDEA: for smart resolves
    // this._resolveAdd = new Bag<Component[]>();
    // this._resolveRemove = new Bag<Component[]>();
    this._resolving = new Bag<[Entity, boolean[]]>();
    this._deleting = new Bag<Entity>();
    this._updatingEntities = [];
    this._updating = new Bag<Bag<SmartUpdate>>();
    this._delta = 0;
    this._lastTime = 0;
    this._elapsed = 0;
  }

  get delta(): number {
    return this._delta;
  }

  get elapsed(): number {
    return this._elapsed;
  }

  get lastTime(): number {
    return this._lastTime;
  }

  /**
   * stop a recently created entity from being resolved
   * @param entity the entity to abort
   */
  abort(entity: Entity): void {
    this._creating.set(entity.id, undefined);
    this.componentManager.deleteEntity(entity);
    this.entityManager.deleteEntity(entity);
  }

  /**
   * add a component to an entity
   * @param entity the entity to receive the component
   * @param component the component to add
   */
  addComponent(entity: Entity, component: Component): void {
    this.componentManager.addComponent(entity, component);
    // IDEA: for smart resolves
    // this.resolveAdd(entity.id, component);
  }

  addComponentById(id: number, component: Component): void {
    this.componentManager.addComponentById(id, component);
    // IDEA: for smart resolves
    // this.resolveAdd(id, component);
  }

  /**
   * create a new entity
   * @returns the created entity
   */
  createEntity(): Entity {
    const entity = this.entityManager.create();
    this._creating.set(entity.id, entity);
    return entity;
  }

  create(): EntityBuilder {
    return makeEntityBuilder(this);
  }

  /**
   * delete an entity
   * @param entity the entity to delete
   */
  deleteEntity(entity: Entity): void {
    this._deleting.set(entity.id, entity);
  }

  /**
   * deletes multiple entities
   * @param entities the entity to delete
   */
  deleteEntities(entities: Entity[]): void {
    for (let i = entities.length; i--; ) {
      this.deleteEntity(entities[i]);
    }
  }

  deleteEntityBag(entities: Bag<Entity>): void {
    this._deleting.setBag(entities);
  }

  getComponentsByType(component: typeof Component): Bag<Component> | undefined {
    return this.componentManager.getComponentsByType(component);
  }

  /**
   * get the component for the specified entity of the specified component class
   * @param entity the owning entity
   * @param component the class of component to retrieve
   * @returns the component for the entity or `undefined` if it doesnt exist
   */
  getComponent(
    entity: Entity,
    component: typeof Component
  ): Component | undefined {
    return this.componentManager.getComponent(entity, component);
  }

  getComponentById(
    id: number,
    component: typeof Component
  ): Component | undefined {
    return this.componentManager.getComponentById(id, component);
  }

  /**
   * a very useful component retrieval function
   * @param entity entity who owns the component
   * @param component the component type to retrieve
   * @returns the instance of that component, if any
   */
  getComponentOfType<T extends typeof Component>(
    entity: Entity,
    component: T
  ): InstanceType<T> {
    return this.getComponent(entity, component) as InstanceType<T>;
  }

  /**
   * a very useful component retrieval function
   * @param id id of entity who owns the component
   * @param component the component type to retrieve
   * @returns the instance of that component, if any
   */
  getComponentOfTypeById<T extends typeof Component>(
    id: number,
    component: T
  ): InstanceType<T> {
    return this.getComponentById(id, component) as InstanceType<T>;
  }

  /**
   * gets a component for the given entity with the given typeId
   * @param entity to retrieve component from
   * @param typeId the numeric type of the component
   * @returns the instance of that component type, if any
   */
  getComponentByTypeId<T extends typeof Component>(
    entity: Entity,
    typeId: number
  ): InstanceType<T> {
    return this.componentManager.getComponentByType(
      entity,
      typeId
    ) as InstanceType<T>;
  }

  /**
   * returns the entity with the spcified `id` if it exists
   * @param id the id of the entity requested
   * @returns the required entity if found or `undefined`
   */
  getEntity(id: number): Entity | undefined {
    return this.entityManager.getEntity(id);
  }

  /**
   * gets the entity assigned to the given tag
   * @param tag the tag to retrieve
   * @returns the entity if tagged, otherwise `undefined`
   */
  getEntityByTag(tag: string): Entity | undefined {
    return this.tagManager.getEntityByTag(tag);
  }

  /**
   * returns the `Bag` of entities for the specified group
   * @param group the group to retrieve
   * @returns the bag for the specified group
   */
  getGroup(group: string): Bag<Entity> | undefined {
    return this.groupManager.getGroup(group);
  }

  /**
   * checks if the given entity has a component of the specified entity type
   * @param entity the entity to check
   * @param type the type field of the component to check
   * @returns `true` if the entity has the component otherwise `false`
   */
  hasComponent(entity: Entity, type: number): boolean {
    return this.componentManager.hasComponent(entity, type);
  }

  /**
   * checks if the given entity has a component of the specified entity type
   * @param entity the entity to check
   * @param componentType type to check
   * @returns `true` if the entity has the component otherwise `false`
   */
  hasComponentOfType(entity: Entity, componentType: typeof Component): boolean {
    return this.componentManager.hasComponent(entity, componentType.type);
  }

  /**
   * checkes if the given entity has a component of the specified entity type
   * @param id the entity id to check
   * @param componentType type to check
   * @returns `true` if the entity has the component otherwise `false`
   */
  hasComponentOfTypeById(id: number, componentType: typeof Component): boolean {
    return this.componentManager.hasComponentById(id, componentType.type);
  }

  /**
   * checks if the entity witht he given id has a component of the specified entity type
   * @param id the id of the entity to check
   * @param type the type field of the component to check
   * @returns `true` if the entity has the component otherwise `false`
   */
  hasComponentById(id: number, type: number): boolean {
    return this.componentManager.hasComponentById(id, type);
  }

  /**
   * checks if the tagged entity has a component of the specified entity type
   * @param tag the tagged entity to check
   * @param type the type field of the component to check
   * @returns `true` if the entity has the component otherwise `false`
   */
  hasComponentByTag(tag: string, type: number): boolean {
    return this.componentManager.hasComponentByTag(tag, type);
  }
  /**
   * checks if the tagged entity has a component of the specified entity type
   * @param tag the tagged entity to check
   * @param component the componen type to check
   * @returns `true` if the entity has the component otherwise `false`
   */
  hasComponentOfTypeByTag(tag: string, component: typeof Component): boolean {
    return this.componentManager.hasComponentOfTypeByTag(tag, component);
  }

  initializeSystems(): void {
    this.systemManager.initializeSystems();
  }

  loadSystems(): void {
    this.systemManager.loadSystems();
  }

  /**
   * makes a component mapper for the specific component type
   * @param component a component type to use to build the mapper
   * @return a component mapper for the given component type
   */
  makeMapper<T extends Component>(component: new () => T): ComponentMapper<T> {
    return new ComponentMapper(component, this);
  }

  /**
   * registeres a component with the component manager
   * @param component the component type to register
   */
  registerComponent(component: typeof Component): void {
    this.componentManager.registerComponent(component);
  }

  registerSystem<T extends EntitySystem>(
    System: new (props: EntitySystemArgs) => T,
    { reactive = false, priority = 0, ...props }: SystemRegistrationArgs
  ): T {
    return this.systemManager.registerSystem(System, {
      reactive,
      priority,
      ...props,
    });
  }

  /**
   * remove the given component from its owner
   * @param component the component to remove
   */
  removeComponent(component: Component): void {
    // this.resolveRemove(component.owner, component);
    this.componentManager.removeComponent(component);
  }

  /**
   * remove the component of the given type from the specified entity
   * @param entity the target entity
   * @param component the component type to remove
   */
  removeComponentType(entity: Entity, component: typeof Component): void {
    // IDEA: for when we introduce smart resolves
    // const comp = this.componentManager.getComponentById(entity.id, component);
    // comp && this.resolveRemove(comp.owner, comp);
    this.componentManager.removeComponentType(entity, component);
  }

  removeComponentTypeById(id: number, component: typeof Component): void {
    // IDEA: for when we introduce smart resolves
    // const comp = this.componentManager.getComponentById(id, component);
    // comp && this.resolveRemove(comp.owner, comp);
    this.componentManager.removeComponentTypeById(id, component);
  }

  /**
   * resolve the given entity against the current ecs instance. This will
   * let all registered systems whose queries match the entity receive it
   * for processing
   * @param entity the entity to resolve
   */
  resolve(entity: Entity, ignoredSystems: number[] = []): void {
    const ignored: boolean[] = [];
    for (let i = ignoredSystems.length; i--; ) {
      ignored[ignoredSystems[i]] = true;
    }
    this._resolving.set(entity.id, [entity, ignored]);
  }

  // IDEA: for when we add smart resolves
  // resolveAdd(id: number, component: Component): void {
  //   // don't add if its a new component
  //   if (this._creating.has(id)) return;
  //   if (!this._resolveAdd.has(id)) this._resolveAdd.set(id, []);
  //   this._resolveAdd.get(id)?.push(component);
  // }

  // IDEA: for when we add smart resolves
  // resolveRemove(id: number, component: Component): void {
  //   if (!this._resolveRemove.has(id)) this._resolveRemove.set(id, []);
  //   this._resolveRemove.get(id)?.push(component);
  // }

  /**
   * resolve the entity that has the given id against he current ecs instance.
   * this will let all registered sytems whose queries match the entity receive
   * it for processing
   * @param id the id of the entity to resolve
   */
  resolveById(id: number, ignoredSystems: number[] = []): void {
    const ignored: boolean[] = [];
    for (let i = ignoredSystems.length; i--; ) {
      ignored[ignoredSystems[i]] = true;
    }
    const entity = this.getEntity(id);
    entity && this._resolving.set(id, [entity, ignored]);
  }

  /**
   * performs initial resolve of all early defined entities
   */
  initialResolve(): void {
    const creating = this._creating;
    this._creating = new Bag<Entity>(creating.capacity);
    // verify there is work to do in the sparse bag
    if (creating.count > 0) {
      for (let i = creating.length; i--; ) {
        const entity = creating.get(i);
        entity && this.systemManager.initialAdd(entity);
      }
    }
  }

  /**
   * performs initial create of all early defined entities (load phase)
   */
  initialCreate(): void {
    const creating = this._creating;
    this._creating = new Bag<Entity>(creating.capacity);
    // verify there is work to do in the sparse bag
    if (creating.count > 0) {
      for (let i = creating.length; i--; ) {
        const entity = creating.get(i);
        entity && this.systemManager.initialCreate(entity);
      }
    }
  }

  /**
   * triggers the resolution update cycle. this processes all new, resolving,
   * updating, and deleting entities
   */
  resolveEntities(): void {
    // move the memory into some temp variables, so that if any of the below
    // processes cause an update to any of them, they are not possibly lost
    const deleting = this._deleting,
      resolving = this._resolving,
      // IDEA: for when we introduce smart resolves
      // resolveAdd = this._resolveAdd,
      // resolveRemove = this._resolveRemove,
      updating = this._updating, //Object.values(this._updating),
      updatingEntities = this._updatingEntities,
      // NOTE: `this._creating` doesn't get reset immediately because we want to wait until later
      //       this helps prevent system-spammy creates
      creating = this._creating;

    this._deleting = new Bag<Entity>(deleting.capacity);
    this._resolving = new Bag<[Entity, boolean[]]>(resolving.capacity);
    // IDEA: for when we introduce smart resolves
    // this._resolveAdd = new Bag<Component[]>(resolveAdd.capacity);
    // this._resolveRemove = new Bag<Component[]>(resolveRemove.capacity);
    this._updating = new Bag<Bag<SmartUpdate>>(updating.capacity);
    this._updatingEntities = [];

    if (deleting.count > 0) {
      for (let i = deleting.length; i--; ) {
        const entity = deleting.get(i);
        if (!entity) continue;
        this.systemManager.deleteEntity(entity);
        this.tagManager.deleteEntity(entity);
        this.groupManager.deleteEntity(entity);
        this.componentManager.deleteEntity(entity);
        this.entityManager.deleteEntity(entity);
        // IDEA: for when we introduce smart resolves
        // resolveAdd.set(entity.id, undefined);
        // resolveRemove.set(entity.id, undefined);
      }
    }

    if (resolving.count > 0) {
      // for (let i = resolving.length; i--; ) {
      //   const entity = resolving.get(i);
      //   if (!entity) continue;
      // IDEA: for when we introduce smart resolves
      // if (resolveAdd.has(entity.id)) {
      //   // we need to add the smart resolves components first
      //   const components = resolveAdd.get(entity.id);
      //   if(components){
      //     console.log('ei:re:r-ra::', entity.id);
      //     this.componentManager.addComponents(entity.id, components);
      //     this.systemManager.resolveAdd(components);
      //     resolveAdd.set(i, undefined);
      //     continue;
      //   }
      // }
      // if (resolveRemove.has(entity.id)) {
      //   // we need to remove the smart resolves components first
      //   const components = resolveRemove.get(entity.id);
      //   if(components){
      //     console.log('ei:re:r-rr::', entity.id);
      //     this.systemManager.resolveRemove(components);
      //     this.componentManager.removeComponents(components);
      //     resolveRemove.set(i, undefined);
      //     continue;
      //   }
      // }
      // this.systemManager.resolveEntity(entity);
      // }
      this.systemManager.resolveEntities(resolving);
    }

    // IDEA: for when we introduce smart resolves
    // verify there is work to do in the sparse bag
    // if (resolveAdd.count > 0) {
    //   for (let i = resolveAdd.length; i--; ) {
    //     const components = resolveAdd.get(i);
    //     if (components) {
    //       this.componentManager.addComponents(i, components);
    //       this.systemManager.resolveAdd(components);
    //     }
    //   }
    // }

    // IDEA: for when we introduce smart resolves
    // verify there is work to do in the sparse bag
    // if (resolveRemove.count > 0) {
    //   for (let i = resolveRemove.length; i--; ) {
    //     const components = resolveRemove.get(i);
    //     if (components) {
    //       this.systemManager.resolveRemove(components);
    //       this.componentManager.removeComponents(components);
    //     }
    //   }
    // }

    if (updating.count > 0) {
      this.systemManager.update(updating);
    }

    for (let i = updatingEntities.length; i--; ) {
      this.systemManager.updateEntity(updatingEntities[i]);
    }

    // verify there is work to do in the sparse bag
    if (creating.count > 0) {
      for (let i = creating.length; i--; ) {
        const entity = creating.get(i);
        entity && this.systemManager.createEntity(entity);
        // we do not want to update creating unil after creation is completed
        this._creating.set(i, undefined);
      }
    }
  }

  /**
   * request the scheduler to run all registered systems
   */
  runSystems(state: RootReducer): void {
    this.scheduler.runSystems(state);
  }

  /**
   * take all registered systems and schedule them
   */
  scheduleSystems(): void {
    this.scheduler.systems = this.systemManager.systems;
    this.scheduler.sortSystems();
  }

  /**
   * notify any reactive systems that utilize this component to process
   * the owning entity during its next processing cycle
   * @param component the component to notify systems about
   * @param ignoredSystems the systems this update should ignore
   */
  update(component: Component, ignoredSystems: number[] = []): void {
    if (!this._updating.has(component.owner))
      this._updating.set(component.owner, new Bag<SmartUpdate>());
    const data = this._updating.get(component.owner);
    if (data) {
      const smartUpdate = data.get(component.type);
      let ignored: boolean[] = [];
      if (smartUpdate) {
        ignored = smartUpdate[1];
      }
      for (let i = ignoredSystems.length; i--; ) {
        ignored[ignoredSystems[i]] = true;
      }
      data.set(component.type, [component, ignored]);
    }
  }

  /**
   * notify any reactive systems any entities with the given component type should
   * be processed
   * @param entity which owns the component
   * @param componentType the component type to notify systems about
   * @param ignoredSystems the systems this update should ignore
   */
  updateComponent(
    entity: Entity,
    componentType: typeof Component,
    ignoredSystems: number[] = []
  ) {
    const maybeComponent = this.getComponent(entity, componentType);
    if (maybeComponent) {
      this.update(maybeComponent, ignoredSystems);
    }
  }

  /**
   * notify any reactive systems that utilize these components to
   * process the owning entity during its next processing cycle
   * @param components the components to notify systems about
   * @param ignoredSystems the systems this update should ignore
   */
  updateAll(components: Component[], ignoredSystems: number[] = []): void {
    for (let i = components.length; i--; ) {
      this.update(components[i], ignoredSystems);
    }
  }

  /**
   * notify any reactive systems to process this entity,
   * if its components satisfy their queries
   * @param entity
   */
  updateByEntity(entity: Entity): void {
    this._updatingEntities.push(entity);
  }

  updateByEntities(entities: Entity[]): void {
    this._updatingEntities = this._updatingEntities.concat(entities);
  }

  /**
   * update the internal ecs instance timing information with the current time
   * @param time current time in miliseconds
   */
  updateTime(time: number): void {
    this._delta = time - this._lastTime;
    this._elapsed += this._delta;
    this._lastTime = time;
  }

  /**
   * update the internal ecs instance timing information with a delta time
   * @param delta the time delta since the ecs instance was last updated
   */
  updateByDelta(delta: number): void {
    this._delta = delta;
    this._elapsed += this._delta;
    this._lastTime = performance.now();
  }

  destroy(): void {
    if (!this._destroyed) {
      this._destroyed = true;
      this.cleanUp();
    }
  }

  reset(): void {
    this.systemManager.reset();
    this.componentManager.reset();
    this.tagManager.cleanUp();
    this.groupManager.cleanUp();
    this.entityManager.reset();
  }

  /**
   * tell the ecs instance to cleanup everything
   */
  cleanUp(): void {
    this.systemManager.cleanUp();
    this.componentManager.cleanUp();
    this.groupManager.cleanUp();
    this.tagManager.cleanUp();
    this.entityManager.cleanUp();
    this.scheduler.cleanUp();
  }

  _joiner<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    entity: Entity,
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ):
    | [components: [...OrderedTuple<T>, ...OrderedTuple<V>], entity: Entity]
    | null {
    const id = entity.id;
    let valid = true;
    const result: unknown[] = [];

    if (unwanted) {
      for (let j = unwanted ? unwanted.length : 0; j--; ) {
        if (this.hasComponentById(id, unwanted[j].type)) {
          valid = false;
          break;
        }
      }

      if (!valid) return null;
    }

    if (needed) {
      for (let j = 0; j < needed.length; j++) {
        const gotComponents = this.componentManager.components.get(
          needed[j].type
        );
        const value = gotComponents ? gotComponents.get(id) : undefined;
        valid = (value && valid) as boolean;
        if (!valid) break;
        result.push(value);
      }

      if (!valid) return null;
    }

    if (optional) {
      for (let j = 0; j < optional.length; j++) {
        const gotComponents = this.componentManager.components.get(
          optional[j].type
        );
        const value = gotComponents ? gotComponents.get(id) : undefined;
        result.push(value);
      }
    }

    if (valid)
      return [result, entity] as [
        components: [...OrderedTuple<T>, ...OrderedTuple<V>],
        entity: Entity
      ];
    return null;
  }

  *join<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    entities: Entity[],
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ): IterableIterator<[...OrderedTuple<T>, ...OrderedTuple<V>]> {
    for (let i = entities.length; i--; ) {
      const id = entities[i].id;
      let valid = true;
      const result: unknown[] = [];

      if (unwanted) {
        for (let j = unwanted ? unwanted.length : 0; j--; ) {
          if (this.hasComponentById(id, unwanted[j].type)) {
            valid = false;
            break;
          }
        }

        if (!valid) continue;
      }

      if (needed) {
        for (let j = 0; j < needed.length; j++) {
          const gotComponents = this.componentManager.components.get(
            needed[j].type
          );
          const value = gotComponents ? gotComponents.get(id) : undefined;
          valid = (value && valid) as boolean;
          if (!valid) break;
          result.push(value);
        }

        if (!valid) continue;
      }

      if (optional) {
        for (let j = 0; j < optional.length; j++) {
          const gotComponents = this.componentManager.components.get(
            optional[j].type
          );
          const value = gotComponents ? gotComponents.get(id) : undefined;
          result.push(value);
        }
      }

      if (valid) yield result as [...OrderedTuple<T>, ...OrderedTuple<V>];
    }
    return;
  }

  *joinByBag<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    bag: Bag<Entity>,
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ): IterableIterator<
    [components: [...OrderedTuple<T>, ...OrderedTuple<V>], entity: Entity]
  > {
    for (let i = bag.length; i--; ) {
      const entity = bag.get(i);
      if (!entity) continue;
      const valid = this._joiner(entity, needed, optional, unwanted);
      if (!valid) continue;
      yield valid;
    }
    return;
  }

  *joinByComponentBag<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    bag: Bag<Component>,
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ): IterableIterator<
    [components: [...OrderedTuple<T>, ...OrderedTuple<V>], entity: Entity]
  > {
    for (let i = bag.length; i--; ) {
      const component = bag.get(i);
      if (!component) continue;
      const entity = this.getEntity(component.owner);
      if (!entity) continue;
      const valid = this._joiner(entity, needed, optional, unwanted);
      if (!valid) continue;
      yield valid;
    }
    return;
  }

  *joinByGroup<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    group: string,
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ): IterableIterator<
    [components: [...OrderedTuple<T>, ...OrderedTuple<V>], entity: Entity]
  > {
    const bag = this.groupManager.getGroup(group);
    if (!bag) return [];
    yield* this.joinByBag(bag, needed, optional, unwanted);
  }

  *joinById<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    ids: number[],
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ): IterableIterator<
    [components: [...OrderedTuple<T>, ...OrderedTuple<V>], entity: Entity]
  > {
    for (let i = ids.length; i--; ) {
      const id = ids[i];
      const entity = this.getEntity(id);
      if (!entity) continue;
      let valid = true;
      const result: unknown[] = [];

      if (unwanted) {
        for (let j = unwanted ? unwanted.length : 0; j--; ) {
          if (this.hasComponentById(id, unwanted[j].type)) {
            valid = false;
            break;
          }
        }

        if (!valid) continue;
      }

      if (needed) {
        for (let j = 0; j < needed.length; j++) {
          const gotComponents = this.componentManager.components.get(
            needed[j].type
          );
          const value = gotComponents ? gotComponents.get(id) : null;
          valid = (value && valid) as boolean;
          if (!valid) break;
          result.push(value);
        }

        if (!valid) continue;
      }

      if (optional) {
        for (let j = 0; j < optional.length; j++) {
          const gotComponents = this.componentManager.components.get(
            optional[j].type
          );
          const value = gotComponents ? gotComponents.get(id) : null;
          result.push(value);
        }
      }

      if (valid)
        yield [result, entity] as [
          [...OrderedTuple<T>, ...OrderedTuple<V>],
          Entity
        ];
    }
    return;
  }

  *joinByTag<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    tags: string[],
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ): IterableIterator<
    [components: [...OrderedTuple<T>, ...OrderedTuple<V>], entity: Entity]
  > {
    for (let i = tags.length; i--; ) {
      const tag = tags[i];
      const entity = this.tagManager.getEntityByTag(tag);
      if (!entity) continue;
      let valid = true;
      const result: unknown[] = [];

      if (unwanted) {
        for (let j = unwanted ? unwanted.length : 0; j--; ) {
          if (this.hasComponent(entity, unwanted[j].type)) {
            valid = false;
            break;
          }
        }

        if (!valid) continue;
      }

      if (needed) {
        for (let j = 0; j < needed.length; j++) {
          const gotComponents = this.componentManager.components.get(
            needed[j].type
          );
          const value = gotComponents ? gotComponents.get(entity.id) : null;
          valid = (value && valid) as boolean;
          if (!valid) break;
          result.push(value);
        }

        if (!valid) continue;
      }

      if (optional) {
        for (let j = 0; j < optional.length; j++) {
          const gotComponents = this.componentManager.components.get(
            optional[j].type
          );
          const value = gotComponents ? gotComponents.get(entity.id) : null;
          result.push(value);
        }
      }

      if (valid)
        yield [result, entity] as [
          components: [...OrderedTuple<T>, ...OrderedTuple<V>],
          entity: Entity
        ];
    }
    return;
  }

  /**
   *
   */
  *joinAll<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ): IterableIterator<[...OrderedTuple<T>, ...OrderedTuple<V>]> {
    for (let i = this.entityManager.entities.length; i--; ) {
      const entity = this.entityManager.entities.get(i);
      if (!entity) continue;
      let valid = true;
      const result: unknown[] = [];

      if (unwanted) {
        for (let j = unwanted ? unwanted.length : 0; j--; ) {
          if (this.hasComponentById(i, unwanted[j].type)) {
            valid = false;
            break;
          }
        }

        if (!valid) continue;
      }

      if (needed) {
        for (let j = 0; j < needed.length; j++) {
          const gotComponents = this.componentManager.components.get(
            needed[j].type
          );
          if (gotComponents) {
            const value = gotComponents.get(i);
            if (value && valid) {
              result.push(value);
              continue;
            } else {
              valid = false;
              break;
            }
          } else {
            valid = false;
            break;
          }
        }

        if (!valid) continue;
      }

      if (optional) {
        for (let j = 0; j < optional.length; j++) {
          const gotComponents = this.componentManager.components.get(
            optional[j].type
          );
          if (gotComponents) {
            const value = gotComponents.get(i);
            result.push(value);
          }
        }
      }

      if (valid) yield result as [...OrderedTuple<T>, ...OrderedTuple<V>];
    }
    return;
  }

  *joinBySet<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    set: Set<Entity>,
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ): IterableIterator<
    [components: [...OrderedTuple<T>, ...OrderedTuple<V>], entity: Entity]
  > {
    for (const entity of set) {
      const value = this._joiner(entity, needed, optional, unwanted);
      if (value) {
        yield value;
      }
    }
  }

  *joinByComponentSet<
    T extends ComponentTuple,
    V extends ComponentTuple,
    W extends ComponentTuple
  >(
    set: Set<Component>,
    needed?: [...T],
    optional?: [...V],
    unwanted?: [...W]
  ): IterableIterator<
    [components: [...OrderedTuple<T>, ...OrderedTuple<V>], entity: Entity]
  > {
    for (const component of set) {
      const entity = this.getEntity(component.owner);
      if (!entity) continue;
      const value = this._joiner(entity, needed, optional, unwanted);
      if (!value) continue;
      yield value;
    }
  }

  retrieve<T extends ComponentTuple>(
    entity: Entity,
    components: [...T]
  ): OrderedTuple<T> {
    const results: unknown[] = [];

    for (let j = 0; j < components.length; j++) {
      const gotComponents = this.componentManager.components.get(
        components[j].type
      );
      const value = gotComponents ? gotComponents.get(entity.id) : undefined;
      results.push(value);
    }

    return results as OrderedTuple<T>;
  }

  retrieveById<T extends ComponentTuple>(
    id: number,
    components: [...T]
  ): OrderedTuple<T> {
    const results: unknown[] = [];

    for (let j = 0; j < components.length; j++) {
      const gotComponents = this.componentManager.components.get(
        components[j].type
      );
      const value = gotComponents ? gotComponents.get(id) : undefined;
      results.push(value);
    }

    return results as OrderedTuple<T>;
  }
}
