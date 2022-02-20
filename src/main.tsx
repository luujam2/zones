import { Graph, GraphDir } from './graph';
import stations from '../data/stations';
import connections from '../data/connections';
import React from 'react';
import reactDom from 'react-dom';
import Search from './search';
// import a from '../raw/dlr';
// import a from '../raw/tube';
// import a from '../raw/overground';

// import overground from '../data/overground';
// import dlr from '../data/dlr';
// import tube from '../data/tube';

// const array = overground
//   .concat(dlr)
//   .concat(tube)
//   .filter((stn) => stn.zone != null)
//   .map((stn) => {
//     return {
//       ...stn,
//       commonName: stn.commonName
//         .replace('Rail', '')
//         .replace('Station', '')
//         .replace('Underground', '')
//         .replace('DLR', '')
//         .replace('Dlr', '')
//         .replace(/\(.+\)/, '')
//         .replace('Stn / H&C and Circle Lines', '')
//         .replace('Stn', '')
//         .replace('St.', 'St')
//         .replace("s's", 's')
//         .replace('Shepherds', "Shepherd's")
//         .replace('Paddington - ', 'Paddington')
//         .replace('Queens Park', "Queen's Park")
//         .replace('StPancras', 'St Pancras')
//         .trim(),
//     };
//   })
//   .sort((a, b) => {
//     if (a.commonName < b.commonName) {
//       return -1;
//     }
//     if (a.commonName > b.commonName) {
//       return 1;
//     }
//     return 0;
//   });

// console.log(
//   JSON.stringify(
//     stations
//       .filter((s) => s.zone != '1')
//       .reduce((acc, curr) => {
//         return {
//           ...acc,
//           [curr.commonName
//             .toLowerCase()
//             .replaceAll(' ', '')
//             .replaceAll('&', '')
//             .replaceAll('-', '')
//             .replaceAll("'", '')]: {
//             connections: ['TODO'],
//           },
//         };
//       }, {})
//   )
// );

// const graph = new Graph<number, number>(GraphDir.UNDIRECTED);

// const [first] = graph.addEdge(1, 2, 10);
// graph.addEdge(1, 3, 5);
// graph.addEdge(1, 4, 5);
// graph.addEdge(5, 2, 7);
// graph.addEdge(6, 3, 8);
// const [target] = graph.addEdge(7, 3, 19);
// graph.addEdge(8, 4, 12);
// graph.addEdge(9, 5, 1);
// graph.addEdge(10, 6, 3);

// const dfsFromFirst = graph.bfs(first, target);
// const visitedOrder = Array.from(dfsFromFirst);
// console.log(visitedOrder);

// TODO create node per station in stations json
// TODO create map with key common name mapping to created node
// TODO go through connections map and add edge per station by looking up common name of node and target node (ZONE 2 or further)
// connections map in format {commonName: {connections: [['a', {walkDistance: x}],'b','c']}}

// const array = a.stopPoints.map((b) => {
//   return {
//     commonName: b.commonName,
//     modes: b.modes,
//     id: b.id,
//     zone: b.additionalProperties.find((x) => x.key === 'Zone')?.value,
//   };
// });
// const arrayUniqueByKey = [
//   ...new Map(array.map((item) => [item['commonName'], item])).values(),
// ];

// console.log(JSON.stringify(arrayUniqueByKey));

export type Station = {
  commonName: string;
  modes: string[];
  zone: string;
};

export type Edge = {
  line: string;
};

const pinkReaders = [
  'Blackhorse Road',
  'Canada Water',
  'Clapham Junction',
  'Gospel Oak',
  'Gunnersbury',
  'Hackney Central',
  'Hackney Downs',
  'Highbury & Islington',
  'Kensington (Olympia)',
  'Rayners Lane',
  'Richmond',
  'Stratford',
  'Surrey Quays',
  'West Brompton',
  'Whitechapel',
  'Willesden Junction',
  'Wimbledon',
];

const london = new Graph<Station, Edge>(GraphDir.DIRECTED);

const stationMappings = {};

export const nameToMapKey = (commonName) => {
  return commonName
    .replace('Rail', '')
    .replace('Station', '')
    .replace('Underground', '')
    .replace('DLR', '')
    .replace('Dlr', '')
    .replace(/\(.+\)/, '')
    .replace('Stn / H&C and Circle Lines', '')
    .replace('Stn', '')
    .replace('St.', 'St')
    .replace("s's", 's')
    .replace('Shepherds', "Shepherd's")
    .replace('Paddington - ', 'Paddington')
    .replace('Queens Park', "Queen's Park")
    .replace('StPancras', 'St Pancras')
    .toLowerCase()
    .replaceAll(' ', '')
    .replaceAll('&', '')
    .replaceAll('-', '')
    .replaceAll("'", '')
    .trim();
};

stations.forEach((station) => {
  const commonName = station.commonName
    .replace('Rail', '')
    .replace('Station', '')
    .replace('Underground', '')
    .replace('DLR', '')
    .replace('Dlr', '')
    .replace(/\(.+\)/, '')
    .replace('Stn / H&C and Circle Lines', '')
    .replace('Stn', '')
    .replace('St.', 'St')
    .replace("s's", 's')
    .replace('Shepherds', "Shepherd's")
    .replace('Paddington - ', 'Paddington')
    .replace('Queens Park', "Queen's Park")
    .replace('StPancras', 'St Pancras')
    .toLowerCase()
    .replaceAll(' ', '')
    .replaceAll('&', '')
    .replaceAll('-', '')
    .replaceAll("'", '')
    .trim();

  //add to graph
  const vertex = london.addVertex(station);

  stationMappings[commonName] = vertex;
});

stations.forEach((station) => {
  const commonName = station.commonName
    .replace('Rail', '')
    .replace('Station', '')
    .replace('Underground', '')
    .replace('DLR', '')
    .replace('Dlr', '')
    .replace(/\(.+\)/, '')
    .replace('Stn / H&C and Circle Lines', '')
    .replace('Stn', '')
    .replace('St.', 'St')
    .replace("s's", 's')
    .replace('Shepherds', "Shepherd's")
    .replace('Paddington - ', 'Paddington')
    .replace('Queens Park', "Queen's Park")
    .replace('StPancras', 'St Pancras')
    .toLowerCase()
    .replaceAll(' ', '')
    .replaceAll('&', '')
    .replaceAll('-', '')
    .replaceAll("'", '')
    .trim();
  const links = connections[commonName]?.connections;

  if (links) {
    links.forEach((link) => {
      london.addEdge(stationMappings[commonName], stationMappings[link.name], {
        line: link.line,
      });
    });
  }
});

// const result = london.dijkstras(
//   stationMappings['willesdengreen'],
//   stationMappings['anerley']
// );
// result.forEach((res) => {
//   console.log(res.value.commonName);
// });

// console.log('done---!');

// const bfs = london.isReachable(
//   stationMappings['willesdengreen'],
//   stationMappings['anerley']
// );

// console.log(`is route possible ${bfs}`);

// const dfs = london.dfs(
//   stationMappings['edgware'],
//   stationMappings['norwoodjunction']
// );

// console.log(dfs);

// const result = Array.from(dfs);

// const text = result.map((station: any) => {
//   if (station.value == null) {
//     console.log(station);
//     return null;
//   }
//   return `${station.value.commonName}${
//     pinkReaders.includes(station.value.commonName) ? ' PINK READER' : ''
//   }`;
// });

// console.log(text);
reactDom.render(
  <Search
    stations={stations}
    london={london}
    stationMappings={stationMappings}
  />,
  document.getElementById('output')
);
