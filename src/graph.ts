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
      return this.nodes.get(value);
    } else {
      const vertex = new GraphNode<T, U>(value);
      this.nodes.set(value, vertex);
      return vertex;
    }
  }

  // dfs(first: GraphNode<T, U>, target: GraphNode<T, U>) {
  //   const path = [];
  //   const visited = new Map();
  //   const stack = [];
  //   const result = this.searchTree(first, target, path, visited, stack);

  //   console.log('result---', result);
  //   return result;
  // }

  // searchTree(
  //   node: GraphNode<T, U>,
  //   target: GraphNode<T, U>,
  //   path,
  //   visited,
  //   stack
  // ) {
  //   path.push(node);
  //   visited.set(node, [node]);
  //   //node found return accumulated path
  //   if (node === target) {
  //     return path;
  //   }

  //   // node not found, traverse adjacent nodes
  //   node.getAdjacents().forEach(([node, weight]) => {
  //     if (!visited.has(node)) {
  //       if (node.value == null) {
  //         console.log('error!-----', node);
  //       }
  //       stack.push([node, weight]);
  //     }
  //   });

  //   if (isNodeExplored(node, visited)) {
  //     // if all the adjacents have been visited then the path should be cleaned up
  //     while (
  //       path.length > 0 &&
  //       isNodeExplored(path[path.length - 1], visited)
  //     ) {
  //       path.pop();
  //     }
  //   }

  //   if (stack.length) {
  //     //carry on with traversal
  //     const [n] = stack.pop();
  //     return this.searchTree(n, target, path, visited, stack);
  //   }
  // }

  getNodeNotVisited(
    distances: Map<
      GraphNode<T, U>,
      { number: number } & { node: [GraphNode<T, U>, U] }
    >,
    visited: Map<GraphNode<T, U>, GraphNode<T, U>>,
    target: GraphNode<T, U>
  ) {
    let nextNode = null;
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
      console.log('LAST NODE!=');
      nextNode = distances.get(target);
    }
    // debugger;
    console.log('next node====', nextNode?.node?.[0]?.value?.commonName);
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
      const distance = distances.get(nodeToProcess.node[0]).number;

      //get all the node's children
      const children = nodeToProcess.node[0].getAdjacents();

      children.forEach((c) => {
        //for each child of a given node, check to see it's not pointing to the start node
        const [child] = c;
        if (!(child === node)) {
          // new distance is distance from node to node to process + 1
          const newdistance = distance + 1;

          // if the new distance is lower than the distance stored in the child or a distance doesn't exist for that child,
          // update the distances with the new value and the parent links with the new child
          if (
            !distances.has(child) ||
            distances.get(child).number > newdistance
          ) {
            if (child.value.commonName === 'Imperial Wharf') {
              console.log('child----', newdistance);
            }
            distances.set(child, { number: newdistance, node: c });
            parents.set(child, nodeToProcess);
          }
        }
      });

      //update the list of visited with the processed node
      visited.set(nodeToProcess.node[0], nodeToProcess);

      //find the next node to process
      nodeToProcess = this.getNodeNotVisited(distances, visited, target);
    }

    distances.forEach((d, k) =>
      console.log((k.value as any).commonName, d.number)
    );

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

function isNodeExplored(node, visited) {
  return node.getAdjacents().reduce((acc, [curr]) => {
    if (!visited.has(curr)) {
      return false;
    }

    return acc;
  }, true);
}
