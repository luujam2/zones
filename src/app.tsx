import React, { useEffect, useState } from 'react';
import stations from '../data/stations';
import connections from '../data/connections';
import { Graph, GraphDir } from './graph';

import Filter from './filter';
import Search from './search';

export type Station = {
  commonName: string;
  modes: string[];
  zone: string;
};

export type Edge = {
  line: string;
};

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

export default () => {
  const [filter, setFilter] = useState([]);
  const [london, setLondon] = useState<Graph<Station, Edge>>();
  const [stationMappings, setStationMappings] = useState<any>();

  useEffect(() => {
    const lond = new Graph<Station, Edge>(GraphDir.DIRECTED);
    const mappings = {};
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
      const links = connections[commonName]?.connections;

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
