import type { NextApiRequest, NextApiResponse } from 'next';
import connections from '../../data/connections';
import stations from '../../data/stations';
import routes from '../../data/route-with-times';
import { Connections, Edge, Station } from '../../src/app';
import { Graph, GraphDir } from '../../src/graph';
import { GraphNode } from '../../src/node';
import osis from '../../data/osi';
export const APP_KEY = '383ca4f4e9f446f3a204dfac6b7f3c86';

type Data = {
  name: string;
};

export type RadiusDataResp = {
  stopPoints: Station[];
};

export type PathResp = {
  value: Station | undefined;
  line: string | undefined;
  route: string | undefined;
  direction: string | undefined;
  time: number | undefined;
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
    .replace(/\s+/g, '')
    .replace(/&/g, '')
    .replace(/-/g, '')
    .replace(/'/g, '')
    .trim();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PathResp[] | string>
) {
  const start = req.query.start;
  const end = req.query.end;
  const filter = req.query.filter ?? '';

  if (
    typeof start === 'string' &&
    typeof end === 'string' &&
    typeof filter === 'string'
  ) {
    const lond = new Graph<Station, Edge>(GraphDir.DIRECTED);
    const mappings: { [key: string]: GraphNode<Station, Edge>[] } = {};

    const stationMappings: { [key: string]: Station } = {};

    // generate nodes for for all stations
    stations.forEach((station) => {
      const commonName = nameToMapKey(station.commonName);
      stationMappings[commonName] = station;
      mappings[commonName] = [lond.addVertex(station)];
    });

    //go through the routes and create nodes per station
    routes
      .filter((route) => {
        return !filter.includes(route.line);
      })
      .forEach((route) => {
        route.stations.reduce((acc: any, station, index) => {
          const commonName = nameToMapKey(station.name);
          const nextStation = route.stations[index + 1];

          //if station is zone 1 or next station is zone 1, don't add the link
          if (
            nextStation == null ||
            stationMappings[commonName].zone === '1' ||
            stationMappings[nameToMapKey(nextStation.name)].zone === '1'
          ) {
            return null;
          }

          if (nextStation) {
            const nexs = { ...stationMappings[nameToMapKey(nextStation.name)] };

            if (station.time === 0) {
              console.log('SHOULD NOT BE ADDING THIS EDGE!');
            }
            const [sourceNode, destinationNode] = lond.addEdge(
              acc ? acc : { ...stationMappings[commonName] }, //new source station per route
              nexs, //new target station per route
              {
                line: route.line,
                route: route.name,
                direction: route.direction,
                weight: station.time,
              }
            );

            //add to mappings
            if (!acc) {
              const sourceNodeName = nameToMapKey(sourceNode.value.commonName);
              mappings[sourceNodeName] = [
                ...(mappings[sourceNodeName] ?? []),
                sourceNode,
              ];
            }

            const destinationNodeName = nameToMapKey(
              destinationNode.value.commonName
            );
            mappings[destinationNodeName] = [
              ...(mappings[destinationNodeName] ?? []),
              destinationNode,
            ];

            return nexs;
          }
        }, null);
      });

    //link same node common name to each other
    for (const [key, value] of Object.entries(mappings)) {
      value.forEach((node) => {
        for (let i = 0; i < value.length; i++) {
          if (value[i].value !== node.value) {
            lond.addEdge(node.value, value[i].value, {
              line: 'in-station',
              route: 'in-station',
              weight: 5,
              direction: 'N/A',
            });
          }
        }
      });
    }

    //link all nodes of one station to the osi counterpart
    osis.forEach((osiPair) => {
      const [osiSource, osiDest] = osiPair;
      const sourceStns = mappings[nameToMapKey(osiSource)];
      const destinationStns = mappings[nameToMapKey(osiDest)];

      if (destinationStns == null) {
        console.log('error-----', osiDest);
        return;
      }

      if (sourceStns == null) {
        console.log('error-----', osiSource);
        return;
      }

      sourceStns.forEach((sourceStn) => {
        destinationStns.forEach((destinationStn) => {
          lond.addEdge(sourceStn.value, destinationStn.value, {
            line: 'osi',
            route: 'osi',
            direction: 'N/A',
          });

          lond.addEdge(destinationStn.value, sourceStn.value, {
            line: 'osi',
            route: 'osi',
            direction: 'N/A',
          });
        });
      });
    });

    // check if stations start and end are in zone 1, if so fetch nearest zone 2
    const startNode = stationMappings[start];
    const endNode = stationMappings[end];

    if (!startNode || !endNode) {
      return res.status(400).send('invalid stations');
    }

    const getNearestStation = (data: RadiusDataResp, stn: Station) => {
      const nearestZoneTwo = data.stopPoints.find((sp) => {
        if (!stationMappings[nameToMapKey(sp.commonName)]) {
          return false;
        }
        return stationMappings[nameToMapKey(sp.commonName)].zone !== '1';
      });

      if (nearestZoneTwo) {
        return mappings[nameToMapKey(nearestZoneTwo.commonName)][0];
      }

      //find closest by euclidean distance
      const distance = (a: Station, b: Station) => {
        return Math.sqrt(
          Math.pow(b.lat - a.lat, 2) + Math.pow(b.lon - a.lon, 2)
        );
      };

      const station = stations
        .filter((station) => station.zone !== '1')
        .reduce((a, b) => (distance(stn, a) < distance(stn, b) ? a : b));

      return mappings[nameToMapKey(station.commonName)][0];
    };

    let closestStartStation = null;
    let closestEndStation = null;

    if (startNode.zone === '1') {
      const startData = await fetch(
        `https://api.tfl.gov.uk/StopPoint/?lat=${startNode.lat}&lon=${startNode.lon}&stopTypes=NaptanMetroStation&radius=1500&app_key=${APP_KEY}`
      );

      const startJson: RadiusDataResp = await startData.json();

      closestStartStation = getNearestStation(startJson, startNode);
    }

    if (endNode.zone === '1') {
      const endData = await fetch(
        `https://api.tfl.gov.uk/StopPoint/?lat=${endNode.lat}&lon=${endNode.lon}&stopTypes=NaptanMetroStation&radius=1500&app_key=${APP_KEY}`
      );

      const endJson: RadiusDataResp = await endData.json();

      closestEndStation = getNearestStation(endJson, endNode);
    }

    const result = lond.dijkstras(
      closestStartStation ?? mappings[nameToMapKey(start)][0],
      closestEndStation ?? mappings[nameToMapKey(end)][0]
    );

    const resultArray = Array.from(result);

    const results = resultArray
      .map((resArray) => {
        return {
          value: resArray?.node?.[0].value,
          line: resArray?.node?.[1]?.line,
          route: resArray?.node?.[1]?.route,
          direction: resArray?.node?.[1]?.direction,
          time: resArray?.node?.[1]?.weight,
        };
      })
      .filter((item) => item.line !== 'in-station');

    return res.status(200).json(Array.from(results));
  }

  return res.status(400).send('invalid params');
}
