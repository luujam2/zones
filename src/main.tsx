import { Graph, GraphDir } from './graph';
import stations from '../data/stations';
import connections from '../data/connections';
import React from 'react';
import reactDom from 'react-dom';
import Search from './search';

export type Station = {
  commonName: string;
  modes: string[];
  zone: string;
};

export type Edge = {
  line: string;
};

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
  const commonName = nameToMapKey(station.commonName);

  //add to graph
  const vertex = london.addVertex(station);

  stationMappings[commonName] = vertex;
});

stations.forEach((station) => {
  const commonName = nameToMapKey(station.commonName);
  const links = connections[commonName]?.connections;

  if (links) {
    links.forEach((link) => {
      london.addEdge(
        stationMappings[commonName].value,
        stationMappings[link.name].value,
        {
          line: link.line,
        }
      );
    });
  }
});

reactDom.render(
  <Search
    stations={stations}
    london={london}
    stationMappings={stationMappings}
  />,
  document.getElementById('output')
);
