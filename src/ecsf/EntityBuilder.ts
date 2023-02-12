import { Option, Result } from 'types/common';
import { isSome } from 'utils/helpers';
import { Bag } from './Bag';
import { Component } from './Component';
import { EcsInstance } from './EcsInstance';
import { Entity } from './Entity';

export declare type ComponentBuilderFunction = (
  builder: EntityBuilder
) => Component;
export declare type StringBuilderFunction = (builder: EntityBuilder) => string;

/**
 * creates an Entity builder that allows you to chain common entity build patterns
 * NOTE: entity is not actually created until `build()` is called on this builder
 */
export declare type EntityBuilder = {
  /**
   * finalizes the build of this component
   * @return a `Result` that is either `Ok<Entity>` on success
   *         or `Err<Error>` on failure
   */
  build(): Result<Entity, Error>;
  /**
   * add component to entity
   * @param component the component to add
   * @return this `EntityBuilder`
   */
  add(component: Component): EntityBuilder;
  /**
   * optionally add a component to entity
   * @param maybe is either `Some<Component>` or `None`
   * @return this `EntityBuilder`
   */
  addMaybe(maybe: Option<Component>): EntityBuilder;
  /**
   * add component to entity using a callback function
   * @param callback a `ComponentBuilderFunction` that returns a component
   * @return this `EntityBuilder`
   */
  addWith(callback: ComponentBuilderFunction): EntityBuilder;
  /**
   * add an entity to a group
   * @param group the group to which to add the entity
   * @return this `EntityBuilder`
   */
  group(group: string): EntityBuilder;
  /**
   * add an entity to a group defined by the string returned by `callback`
   * @param callback a `StringBuilderFunction` that returns a string
   * @return this `EntityBuilder`
   */
  groupWith(callback: StringBuilderFunction): EntityBuilder;
  /**
   * get the data stored at the given `key`
   * @param key the location of the data
   * @return the data specified
   */
  getData<T>(key: PropertyKey): T;
  /**
   * get the entity
   * @return the current building entity
   */
  getEntity(): Entity;
  /**
   * get any prior added component
   * @param component the component type desired
   * @return an instance of that component
   */
  get<C extends typeof Component>(component: C): InstanceType<C>;
  /**
   * insert data into builder to be used later in build chain
   * @param key location to store data
   * @param value data to store
   * @return this `EntityBuilder`
   */
  insertData<T>(key: PropertyKey, value: T): EntityBuilder;
  /**
   * set data while with a builder callback,
   * WARNING: does not return a builder (i.e., cannot be chained)
   * @param key the location to store the data
   * @param value the data to store
   */
  setData<T>(key: PropertyKey, value: T): void;
  /**
   * tag an entity with a string
   * @param tag the string with which to tag the entity
   * @return this `EntityBuilder`
   */
  tag(tag: string): EntityBuilder;
  /**
   * tag an entity with the string returned by `callback`
   * @param callback a `StringBuilderFunction` that returns a string
   * @return this `EntityBuilder`
   */
  tagWith(callback: StringBuilderFunction): EntityBuilder;
};

/**
 * creates a builder that allows you to chain calls to build up an entity
 * making creation of entities extremely easy while remaining lightweight
 * and performant
 */
export function makeEntityBuilder(ecs: EcsInstance): EntityBuilder {
  let entity!: Entity;
  const components = new Bag<Component>();
  const componentCallbacks: ComponentBuilderFunction[] = [];
  const tagCallbacks: StringBuilderFunction[] = [];
  const groupCallbacks: StringBuilderFunction[] = [];
  const tags: string[] = [];
  const groups: string[] = [];
  const workingData: Record<PropertyKey, unknown> = {};
  const builder: EntityBuilder = {
    build<E = Error>(): Result<Entity, E> {
      entity = ecs.createEntity();
      try {
        components.forEach(
          (component) => component && ecs.addComponent(entity, component)
        );
        componentCallbacks.forEach((callback) => {
          const component = callback(this);
          components.set(component.type, component);
          ecs.addComponent(entity, component);
        });
        tags.forEach((tag) => ecs.tagManager.tagEntity(tag, entity));
        tagCallbacks.forEach((callback) =>
          ecs.tagManager.tagEntity(callback(this), entity)
        );
        groups.forEach((group) =>
          ecs.groupManager.addEntityToGroup(group, entity)
        );
        groupCallbacks.forEach((callback) =>
          ecs.groupManager.addEntityToGroup(callback(this), entity)
        );
        return entity;
      } catch (e) {
        ecs.abort(entity);
        return e as E;
      }
    },
    add(component: Component): EntityBuilder {
      components.set(component.type, component);
      return this;
    },
    addMaybe(maybe: Option<Component>): EntityBuilder {
      if (isSome(maybe)) {
        components.set(maybe.type, maybe);
      }
      return this;
    },
    insertData<T>(key: PropertyKey, value: T): EntityBuilder {
      workingData[key] = value;
      return this;
    },
    addWith(callback: ComponentBuilderFunction): EntityBuilder {
      componentCallbacks.push(callback);
      return this;
    },
    get<C extends typeof Component>(component: C): InstanceType<C> {
      return components.get(component.type) as InstanceType<C>;
    },
    getData<T>(key: PropertyKey): T {
      return workingData[key] as T;
    },
    getEntity(): Entity {
      return entity;
    },
    group(group: string): EntityBuilder {
      groups.push(group);
      return this;
    },
    groupWith(callback: StringBuilderFunction): EntityBuilder {
      groupCallbacks.push(callback);
      return this;
    },
    setData<T>(key: PropertyKey, value: T): void {
      workingData[key] = value;
    },
    tag(tag: string): EntityBuilder {
      tags.push(tag);
      return this;
    },
    tagWith(callback: StringBuilderFunction): EntityBuilder {
      tagCallbacks.push(callback);
      return this;
    },
  };
  return builder;
}
