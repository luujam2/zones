export class GraphNode<T, U> {
  value: T;
  adjacents: [GraphNode<T, U>, U][];

  constructor(value: T) {
    this.value = value;
    this.adjacents = []; // adjacency list
  }

  addAdjacent(node: GraphNode<T, U>, weight: U) {
    this.adjacents.push([node, weight]);
  }

  getAdjacents() {
    return this.adjacents;
  }
}
