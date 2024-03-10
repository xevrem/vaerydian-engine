import { QuadTree, RectangleRange } from 'fqtree';
import { Spatial } from '../components';

export function makeSpatialSystem() {
  return new QuadTree<Spatial>(new RectangleRange(0, 0, 100, 100));
}
