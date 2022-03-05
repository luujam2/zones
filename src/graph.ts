import { GraphNode } from './node';

export enum GraphDir {
  DIRECTED,
  UNDIRECTED,
}

export class Graph<T, U> {
  nodes: Map<T, GraphNode<T, U>>;
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
      this.nodes.set(value, vertex);
      return vertex;
    }
  }

  removeEdge(edge: [GraphNode<T, U>, U]) {
    this.nodes.forEach((node) => {
      node.removeAdjacent(edge);
    });
  }

  getNodeNotVisited(
    distances: Map<
      GraphNode<T, U>,
      { number: number } & { node: [GraphNode<T, U>, U | null] }
    >,
    visited: Map<GraphNode<T, U>, GraphNode<T, U>>,
    target: GraphNode<T, U>
  ) {
    let nextNode:
      | ({
          number: number;
        } & {
          node: [GraphNode<T, U>, U | null];
        })
      | null
      | undefined = null;
    distances.forEach((value, key) => {
      if (nextNode?.node[0] === target) {
        nextNode = null;
      }

      if (!visited.has(key) && nextNode == null) {
        nextNode = value;
      }

      value.node[0].getAdjacents().forEach(([n]) => {
        if (nextNode) {
          return;
        }

        if (!visited.has(n)) {
          nextNode = distances.get(n);
        }
      });
    });

    if (!nextNode && !visited.has(target)) {
      nextNode = distances.get(target);
    }
    return nextNode;
  }

  dijkstras(node: GraphNode<T, U>, target: GraphNode<T, U>) {
    const distances = new Map<
      GraphNode<T, U>,
      { number: number } & { node: [GraphNode<T, U>, U | null] }
    >();
    const visited = new Map<GraphNode<T, U>, GraphNode<T, U>>();
    const parents = new Map<
      GraphNode<T, U>,
      { number: number | null } & { node: [GraphNode<T, U>, U | null] | null }
    >();

    distances.set(target, { number: Infinity, node: [target, null] });

    parents.set(target, { number: null, node: null });

    //start with starting node, and look at children
    node.getAdjacents().forEach((child) => {
      //for each child of start node, set the distance as 1 and all of them as parents of start node
      const [distance] = child;
      parents.set(distance, { number: null, node: [node, null] });
      distances.set(distance, { number: 1, node: child });
    });

    // find the first node to process. i.e. closest node (all are closest due to no weight)
    let nodeToProcess = this.getNodeNotVisited(distances, visited, target);

    while (nodeToProcess) {
      // get the weight of node to process
      const distance = distances.get(nodeToProcess.node[0])?.number;

      //get all the node's children
      const children = nodeToProcess.node[0].getAdjacents();

      children.forEach((c) => {
        //for each child of a given node, check to see it's not pointing to the start node
        const [child] = c;

        if (!(child === node)) {
          // new distance is distance from node to node to process + 1
          const newdistance = distance ?? 0 + (c as any)[1].weight ?? 1;

          // if the new distance is lower than the distance stored in the child or a distance doesn't exist for that child,
          // update the distances with the new value and the parent links with the new child
          if (
            !distances.has(child) ||
            (distances.get(child)?.number ?? 0) > newdistance
          ) {
            distances.set(child, { number: newdistance, node: c });
            parents.set(
              child,
              nodeToProcess as { number: number } & {
                node: [GraphNode<T, U>, U | null];
              }
            );
          }
        }
      });

      //update the list of visited with the processed node
      visited.set(nodeToProcess.node[0], nodeToProcess.node[0]);

      //find the next node to process
      nodeToProcess = this.getNodeNotVisited(distances, visited, target);
    }

    const path = [];
    let parent = parents.get(target);
    path.push(distances.get(target));
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
