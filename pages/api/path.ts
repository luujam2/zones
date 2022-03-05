import type { NextApiRequest, NextApiResponse } from 'next';
import connections from '../../data/connections';
import stations from '../../data/stations';
import routes from '../../data/routes';
import { Connections, Edge, Station } from '../../src/app';
import { Graph, GraphDir } from '../../src/graph';
import { GraphNode } from '../../src/node';

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
    const mappings: { [key: string]: GraphNode<Station, Edge> } = {};

    // generate nodes for for all stations
    stations.forEach((station) => {
      const commonName = nameToMapKey(station.commonName);

      //add to graph
      const vertex = lond.addVertex(station);

      mappings[commonName] = vertex;
    });

    stations.forEach((station) => {
      const commonName = nameToMapKey(station.commonName);
      const applicableRoutes = routes.filter((route) => {
        return route.stations.includes(station.commonName);
      });

      const stationToRouteLinks = applicableRoutes.reduce(
        (
          acc: { [key: string]: { routes: string[]; line: string }[] },
          route
        ) => {
          const nextStation =
            route.stations[route.stations.indexOf(station.commonName) + 1];

          //same line, same station, different route = add to array of routes
          //different line, same station, different route = add to new line
          //same line, different station = add to nextstation map

          // {
          //   station: {
          //     line: ?[]
          //     routes: ?[]
          //   }
          // }

          if (nextStation) {
            // find if there's an existing line match
            // if yes, add to routes
            // if no, add a new entry
            const existingLineEntry = acc[nextStation]?.find((ns) => {
              return ns.line === route.line;
            });
            if (existingLineEntry) {
              const existingLineEntryIndex = acc[nextStation]?.findIndex(
                (ns) => {
                  return ns.line === route.line;
                }
              );
              return {
                ...acc,
                [nextStation]: [
                  ...acc[nextStation].splice(existingLineEntryIndex, 1),
                  {
                    ...existingLineEntry,
                    routes: [...existingLineEntry.routes, route.name],
                  },
                ],
              };
            }

            return {
              ...acc,
              [nextStation]: [
                ...(acc[nextStation] ?? []),
                { routes: [route.name], line: route.line },
              ],
            };
          }

          return acc;
        },
        {}
      );

      for (const [key, value] of Object.entries(stationToRouteLinks)) {
        value.forEach((meta) => {
          // console.log(
          //   'adding edge------',
          //   meta.line,
          //   meta.routes,
          //   commonName,
          //   key
          // );
          meta.routes.forEach((route) => {
            lond.addEdge(
              mappings[commonName].value,
              mappings[nameToMapKey(key)].value,
              {
                line: meta.line,
                route: route,
              }
            );
          });
        });
      }
    });

    // check if stations start and end are in zone 1, if so fetch nearest zone 2
    const startNode = mappings[start];
    const endNode = mappings[end];

    if (!startNode || !endNode) {
      return res.status(400).send('invalid stations');
    }

    const getNearestStation = (data: RadiusDataResp, stn: Station) => {
      const nearestZoneTwo = data.stopPoints.find((sp) => {
        if (!mappings[nameToMapKey(sp.commonName)]) {
          return false;
        }
        return mappings[nameToMapKey(sp.commonName)]?.value?.zone !== '1';
      });

      if (nearestZoneTwo) {
        return mappings[nameToMapKey(nearestZoneTwo.commonName)];
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

      return mappings[nameToMapKey(station.commonName)];
    };

    let closestStartStation = null;
    let closestEndStation = null;

    if (startNode.value.zone === '1') {
      const startData = await fetch(
        `https://api.tfl.gov.uk/StopPoint/?lat=${startNode.value.lat}&lon=${startNode.value.lon}&stopTypes=NaptanMetroStation&radius=1500`
      );

      const startJson: RadiusDataResp = await startData.json();

      closestStartStation = getNearestStation(startJson, startNode.value);
    }

    if (endNode.value.zone === '1') {
      const endData = await fetch(
        `https://api.tfl.gov.uk/StopPoint/?lat=${endNode.value.lat}&lon=${endNode.value.lon}&stopTypes=NaptanMetroStation&radius=1500`
      );

      const endJson: RadiusDataResp = await endData.json();

      closestEndStation = getNearestStation(endJson, endNode.value);
    }

    const result = lond.dijkstras(
      closestStartStation ?? mappings[nameToMapKey(start)],
      closestEndStation ?? mappings[nameToMapKey(end)]
    );

    const resultArray = Array.from(result);

    const results = resultArray.map((resArray) => {
      return {
        value: resArray?.node?.[0].value,
        line: resArray?.node?.[1]?.line,
        route: resArray?.node?.[1]?.route,
      };
    });

    return res.status(200).json(Array.from(results));
  }

  return res.status(400).send('invalid params');
}
