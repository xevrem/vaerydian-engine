import { EcsInstance } from 'ecsf';
import {create_executor_builder } from 'behavey';



export function create_enemy_ship(ecs: EcsInstance) {
  ecs.create().group('enemy').build();
}
