import React, { useEffect, useState } from 'react';
import stations from '../data/stations';
import connections from '../data/connections';
import { Graph, GraphDir } from './graph';

import Filter from './filter';
import Search from './search';
import { GraphNode } from './node';

export type Station = {
  commonName: string;
  modes: string[];
  zone: string;
  lat: number;
  lon: number;
};

export type Edge = {
  line: string;
};

type Connections = {
  [key: string]: {
    connections: { name: string; line: string }[];
  };
};

export const nameToMapKey = (commonName: string) => {
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

export default () => {
  const [filter, setFilter] = useState<string[]>([]);
  const [london, setLondon] = useState<Graph<Station, Edge>>();
  const [stationMappings, setStationMappings] =
    useState<{ [key: string]: GraphNode<Station, Edge> }>();

  useEffect(() => {
    const lond = new Graph<Station, Edge>(GraphDir.DIRECTED);
    const mappings: { [key: string]: GraphNode<Station, Edge> } = {};
    console.log('filter', filter);
    // generate nodes for for all stations
    stations.forEach((station) => {
      const commonName = nameToMapKey(station.commonName);

      //add to graph
      const vertex = lond.addVertex(station);

      mappings[commonName] = vertex;
    });

    stations.forEach((station) => {
      const commonName = nameToMapKey(station.commonName);
      const links = (connections as Connections)[commonName]?.connections;

      if (links) {
        links.forEach((link) => {
          if (!filter.includes(link.line)) {
            lond.addEdge(
              mappings[commonName].value,
              mappings[link.name].value,
              {
                line: link.line,
              }
            );
          }
        });
      }
    });
    console.log('updating london', lond);
    setLondon(lond);
    setStationMappings(mappings);
  }, [filter]);

  if (!london || !stationMappings) {
    return <div>error</div>;
  }

  return (
    <>
      <Filter
        lines={[
          'dlr',
          'overground',
          'picadilly',
          'district',
          'metropolitan',
          'northern',
          'hammersmith',
          'central',
          'jubilee',
          'victoria',
          'circle',
          'bakerloo',
        ]}
        setFilter={setFilter}
        filter={filter}
      />
      <Search
        stations={stations}
        london={london}
        stationMappings={stationMappings}
      />
    </>
  );
};
