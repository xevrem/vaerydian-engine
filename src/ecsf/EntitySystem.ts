import { Bag } from './Bag';
import { Entity } from './Entity';
import { ComponentTuple, EcsInstance, OrderedTuple } from './EcsInstance';
import { Query } from './Query';
import { RootReducer } from 'types/modules';

export declare interface EntitySystemArgs {
  id: number;
  ecsInstance: EcsInstance;
  reactive: boolean;
  priority: number;
  [option: string]: unknown;
}

export class EntitySystem<
  T extends ComponentTuple = ComponentTuple,
  V extends ComponentTuple = ComponentTuple,
  W extends ComponentTuple = ComponentTuple
> {
  private _id = -1;
  private _entities: Bag<Entity> = new Bag<Entity>();
  private _ecsInstance: EcsInstance;
  private _reactive: boolean;
  private _priority: number;
  private _query!: Query<T, V, W>;
  private _active = true;
  private _dirty = false;
  props: EntitySystemArgs;
  needed!: [...T];
  optional!: [...V];
  unwanted!: [...W];

  constructor(props: EntitySystemArgs) {
    this.props = props;
    this._id = props.id;
    this._ecsInstance = props.ecsInstance;
    this._reactive = props.reactive || false;
    this._priority = props.priority || 0;
  }

  get id(): number {
    return this._id;
  }

  get ecs(): EcsInstance {
    return this._ecsInstance;
  }

  get ecsInstance(): EcsInstance {
    return this._ecsInstance;
  }

  set ecsInstance(value: EcsInstance) {
    this._ecsInstance = value;
  }

  get entities(): Bag<Entity> {
    return this._entities;
  }

  get reactive(): boolean {
    return this._reactive;
  }

  get priority(): number {
    return this._priority;
  }

  get query(): Query<T, V, W> {
    return this._query;
  }

  get active(): boolean {
    return this._active;
  }

  get dirty(): boolean {
    return this._dirty;
  }

  get componentTypes(): [...ComponentTuple] {
    let result: [...ComponentTuple] = this.needed;
    if (this.optional) {
      result = result.concat(this.optional);
    }
    if (this.unwanted) {
      result = result.concat(this.unwanted);
    }
    return result;
  }

  /**
   * enable this system
   */
  enable(): void {
    this._active = true;
  }

  /**
   * disable this system
   */
  disable(): void {
    this._active = false;
  }

  buildQuery(): void {
    this._query = new Query<T, V, W>({
      ecsInstance: this._ecsInstance,
      needed: this.needed,
      unwanted: this.unwanted || [],
      optional: this.optional || [],
    });
  }

  /**
   * remove the given entity from this system, calling the system's removed function
   * if successful
   * @param entity the entity to remove
   */
  removeEntity(entity: Entity): void {
    if (this._entities.has(entity.id)) {
      this._entities.set(entity.id, undefined);
      this.removed && this.removed(entity);
      this._dirty = true;
    }
  }

  removeEntityById(id: number): void {
    const entity = this._entities.get(id);
    if (entity) {
      this._entities.set(id, undefined);
      this.removed && this.removed(entity);
      this._dirty = true;
    }
  }

  initialAdd(entity: Entity): void {
    this._entities.set(entity.id, entity);
    this._dirty = true;
  }

  initialCreate(entity: Entity): void {
    this.created && this.created(entity);
    this._dirty = true;
  }

  /**
   * add the entity with the given id to this system
   * @param id the id of the entity to add
   */
  addEntityById(id: number): void {
    const entity = this._ecsInstance.getEntity(id);
    if (!entity) return;
    this.addEntity(entity);
  }

  /**
   * add the entity to this system
   * @param entity the entity to add
   */
  addEntity(entity: Entity): void {
    if (!this._entities.has(entity.id)) {
      this._entities.set(entity.id, entity);
      this.added && this.added(entity);
      this._dirty = true;
    }
  }

  createEntity(entity: Entity): void {
    this._entities.set(entity.id, entity);
    this.created && this.created(entity);
    this._dirty = true;
  }

  /**
   * adds an entity without calling `added`
   * @param id the id of the entity to add
   */
  addByUpdateById(id: number): void {
    const entity = this._ecsInstance.getEntity(id);
    if (!entity) return;
    this.addByUpdate(entity);
  }

  /**
   * adds an entity without calling `added`
   * @param entity the entity to add
   */
  addByUpdate(entity: Entity): void {
    this._entities.set(entity.id, entity);
    this._dirty = true;
  }

  deleteEntity(entity: Entity): void {
    if (this._reactive) {
      this.deleted && this.deleted(entity);
      this._dirty = true;
    } else {
      if (this._entities.has(entity.id)) {
        this._entities.set(entity.id, undefined);
        this.deleted && this.deleted(entity);
        this._dirty = true;
      }
    }
  }

  /**
   * clean this system, calling its `cleanUp` function and clearing
   * all owned entities
   */
  cleanSystem(): void {
    this.cleanUp && this.cleanUp(this._entities);
    this._entities.clear();
  }

  /**
   * process all entities
   */
  processAll(state: RootReducer): void {
    if (this.shouldProcess(state)) {
      this.begin && this.begin(state);
      this.processEntities(state);
      this.processJoin(state);
      this.end && this.end(state);
    }
  }

  processJoin(state: RootReducer): void {
    if (!this.join) return;
    // if we have no entities, don't bother running
    if (!this._entities.count) return;
    if (this._dirty) this.resolveQuery();
    const data = this._query.data;
    for (let i = data.length; i--; ) {
      const [components, entity] = data[i];
      this.join(entity, components, state);
    }
  }

  /**
   * processes entities one by one calling the system's `process` function
   * and passing the results of the systems `Query`
   */
  processEntities(state: RootReducer): void {
    if (!this.process) return;
    // if we have no entiteis, don't bother
    if (!this._entities.count) return;
    // process up to the last inserted entity
    for (let i = this._entities.length; i--; ) {
      const entity = this._entities.get(i);
      entity &&
        this.process(entity, this._query, this._ecsInstance.delta, state);
    }
  }

  /**
   * determine whether or not this system should process
   */
  shouldProcess(
    // eslint-disable-next-line
    _state: RootReducer
  ): boolean {
    return true;
  }

  resolveQuery() {
    this.query.resolve(this._entities);
    this._dirty = false;
  }

  resetSystem(): void {
    this.reset && this.reset();
    this._entities.clear();
  }

  /*
   * extendable lifecycle functions
   */
  initialize?(): void;
  load?(entities: Bag<Entity>): void;
  created?(entity: Entity): void;
  deleted?(entity: Entity): void;
  added?(entity: Entity): void;
  removed?(entity: Entity): void;
  cleanUp?(entities: Bag<Entity>): void;
  reset?(): void;
  begin?(state: RootReducer): void;
  end?(state: RootReducer): void;
  process?(
    entity: Entity,
    query: Query<T, V, W>,
    delta: number,
    state: RootReducer
  ): void;
  /**
   * alternate to `process`, but auto-retrieves all needed/optional components
   * for entities in a very efficient data structure. Components are returned in
   * the exact order of the `needed` array followed by `optional` array
   */
  join?(
    entity: Entity,
    components: [...OrderedTuple<T>, ...OrderedTuple<V>],
    state: RootReducer
  ): void;
}
