import { GraphNode } from './node';

export enum GraphDir {
  DIRECTED,
  UNDIRECTED,
}

export class Graph<T, U> {
  nodes: Map<any, GraphNode<T, U>>;
  edgeDirection: GraphDir;

  constructor(edgeDirection = GraphDir.UNDIRECTED) {
    this.nodes = new Map();
    this.edgeDirection = edgeDirection;
  }

  addEdge(source: T, destination: T, weight: U) {
    const sourceNode = this.addVertex(source);
    const destinationNode = this.addVertex(destination);
    sourceNode.addAdjacent(destinationNode, weight);

    if (this.edgeDirection === GraphDir.UNDIRECTED) {
      destinationNode.addAdjacent(sourceNode, weight);
    }

    return [sourceNode, destinationNode];
  }

  addVertex(value: T): GraphNode<T, U> {
    if (this.nodes.has(value)) {
      return this.nodes.get(value) as GraphNode<T, U>;
    } else {
      const vertex = new GraphNode<T, U>(value);
      this.nodes.set(vertex, vertex);
      return vertex;
    }
  }

  isReachable(first: GraphNode<T, U>, target: GraphNode<T, U>) {
    const visited = new Map();
    const visitList: [GraphNode<T, U>, U][] = [];

    visitList.push([first] as any);

    while (!(visitList.length === 0) && !visited.has(target)) {
      //take the first node off the queue
      const [node, weight] = visitList.shift() as [GraphNode<T, U>, U];

      // if node exists and it hasn't been visited, add it to list of visited
      // traverse child nodes
      if (node && !visited.has(node)) {
        visited.set(node, [node, weight]);
        node.getAdjacents().forEach(([adj, weight]) => {
          visitList.push([adj, weight]);
        });
      } else {
        return true;
      }
    }

    return visited.values();
  }

  dfs(first: GraphNode<T, U>, target: GraphNode<T, U>) {
    const path = [];
    const visited = new Map();
    const stack = [];

    return this.searchTree(first, target, path, visited, stack);
  }

  searchTree(
    node: GraphNode<T, U>,
    target: GraphNode<T, U>,
    path,
    visited,
    stack
  ) {
    path.push(node);
    visited.set(node, [node]);
    //node found return accumulated path
    if (node === target) {
      return path;
    }

    // node not found, traverse adjacent nodes
    node.getAdjacents().forEach(([node, weight]) => {
      if (!visited.has(node)) {
        if (node.value == null) {
          console.log('error!-----', node);
        }
        stack.push([node, weight]);
      }
    });

    if (isNodeExplored(node, visited)) {
      // if all the adjacents have been visited then the path should be cleaned up
      while (isNodeExplored(path[path.length - 1], visited)) {
        path.pop();
      }
    }

    if (stack.length) {
      //carry on with traversal
      const [n] = stack.pop();
      return this.searchTree(n, target, path, visited, stack);
    }
  }

  getNodeNotVisited(
    distances: Map<
      GraphNode<T, U>,
      { number: number } & { node: [GraphNode<T, U>, U] }
    >,
    visited: Map<GraphNode<T, U>, GraphNode<T, U>>
  ) {
    let nextNode = null;
    distances.forEach((value, key) => {
      if (!visited.has(key)) {
        nextNode = value;
      }
    });

    return nextNode;
  }

  dijkstras(node: GraphNode<T, U>, target: GraphNode<T, U>) {
    const distances = new Map<
      GraphNode<T, U>,
      { number: number } & { node: [GraphNode<T, U>, U] }
    >();
    const visited = new Map<GraphNode<T, U>, GraphNode<T, U>>();
    const parents = new Map<
      GraphNode<T, U>,
      { number: number } & { node: [GraphNode<T, U>, U] }
    >();

    distances.set(target, { number: Infinity, node: [target, null] });

    parents.set(target, { number: null, node: null });

    node.getAdjacents().forEach((child) => {
      const [distance] = child;
      parents.set(distance, { number: null, node: [node, null] });
      distances.set(distance, { number: 1, node: child });
    });

    let nodeToProcess = this.getNodeNotVisited(distances, visited);
    console.log('STARTING-------');
    while (nodeToProcess) {
      const distance = distances.get(nodeToProcess.node[0]).number;

      const children = nodeToProcess.node[0].getAdjacents();

      children.forEach((c) => {
        const [child] = c;
        if (!(child === node)) {
          const newdistance = distance + 1;

          if (
            !distances.has(child) ||
            distances.get(child).number > newdistance
          ) {
            distances.set(child, { number: newdistance, node: c });
            parents.set(child, nodeToProcess);
          }
        }
      });

      visited.set(nodeToProcess.node[0], nodeToProcess);

      nodeToProcess = this.getNodeNotVisited(distances, visited);
    }
    console.log('DONE--------------');

    const path = [];
    let parent = parents.get(target);
    while (parent) {
      const par = (parent as any)?.node?.[0];

      if (par) {
        path.push(parent);
      }
      parent = parents.get(par);
    }
    return path.reverse();
  }
}

function isNodeExplored(node, visited) {
  return node.getAdjacents().reduce((acc, [curr]) => {
    if (!visited.has(curr)) {
      return false;
    }

    return acc;
  }, true);
}
