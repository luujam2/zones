export class GraphNode<T, U> {
  value: T;
  adjacents: [GraphNode<T, U>, U][];

  constructor(value: T) {
    this.value = value;
    this.adjacents = []; // adjacency list
  }

  addAdjacent(node: GraphNode<T, U>, weight: U) {
    const adjacent: [GraphNode<T, U>, U] = [node, weight];
    this.adjacents.push(adjacent);
    return adjacent;
  }

  removeAdjacent(node: [GraphNode<T, U>, U]) {
    const index = this.adjacents.indexOf(node);
    if (index > -1) {
      this.adjacents.splice(index, 1);
      return node;
    }
  }

  getAdjacents() {
    return this.adjacents;
  }
}
