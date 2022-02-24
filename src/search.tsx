import React, { useEffect, useState } from 'react';
import { Graph } from './graph';
import { Edge, nameToMapKey, Station } from './main';
import Result from './result';
import useSWR, { Fetcher } from 'swr';

const fetcher = (args) => fetch(args).then((res) => res.json());

export default ({
  stations,
  london,
  stationMappings,
}: {
  stations: Station[];
  london: Graph<Station, Edge>;
  stationMappings: any;
}) => {
  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');
  const [result, setResult] = useState(null);
  const [dfsResult, setDfsResult] = useState(null);
  const [zoneOneStart, setZoneOneStart] = useState(null);
  const [zoneOneEnd, setZoneOneEnd] = useState(null);
  const [dijkstraStart, setDijkstraStart] = useState(null);
  const [dijkstraEnd, setDijkstraEnd] = useState(null);

  useEffect(() => {
    if (dijkstraStart == null || dijkstraEnd == null) {
      return;
    }

    console.log('RUNNING RESULT WITH', dijkstraStart, dijkstraEnd);

    const res = london.dijkstras(dijkstraStart, dijkstraEnd);
    setResult(Array.from(res));
  }, [dijkstraStart, dijkstraEnd]);

  const { data: startData, error } = useSWR(
    zoneOneStart
      ? `https://api.tfl.gov.uk/StopPoint/?lat=${zoneOneStart.lat}&lon=${zoneOneStart.lon}&stopTypes=NaptanMetroStation&radius=1500`
      : null,
    fetcher
  );

  const { data: endData } = useSWR(
    zoneOneEnd
      ? `https://api.tfl.gov.uk/StopPoint/?lat=${zoneOneEnd.lat}&lon=${zoneOneEnd.lon}&stopTypes=NaptanMetroStation&radius=1500`
      : null,
    fetcher
  );

  const getNearestStation = (data) => {
    const nearestZoneTwo = data.stopPoints.find((sp) => {
      console.log(sp.commonName);
      if (!stationMappings[nameToMapKey(sp.commonName)]) {
        return false;
      }
      return stationMappings[nameToMapKey(sp.commonName)]?.value?.zone !== '1';
    });

    if (nearestZoneTwo) {
      return stationMappings[nameToMapKey(nearestZoneTwo.commonName)];
    }

    //find closest by euclidean distance
    const distance = (a, b) => {
      return Math.sqrt(Math.pow(b.lat - a.lat, 2) + Math.pow(b.lon - a.lon, 2));
    };

    const station = stations
      .filter((station) => station.zone !== '1')
      .reduce((a, b) =>
        distance(zoneOneStart, a) < distance(zoneOneStart, b) ? a : b
      );

    return stationMappings[nameToMapKey(station.commonName)];
  };

  useEffect(() => {
    if (startData) {
      const closest = getNearestStation(startData);
      setDijkstraStart(closest);
    }

    if (endData) {
      const closest = getNearestStation(endData);
      setDijkstraEnd(closest);
    }
  }, [startData, endData]);

  const dfs = false;
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const start = stationMappings[nameToMapKey(startStation)];
          const end = stationMappings[nameToMapKey(endStation)];
          if (start.value.zone === '1') {
            console.log(start.value.lat, start.value.lon);
            setZoneOneStart(start.value);
          } else {
            setDijkstraStart(start);
          }

          if (end.value.zone === '1') {
            console.log(end.value.lat, end.value.lon);
            return setZoneOneEnd(end.value);
          } else {
            setDijkstraEnd(end);
          }
          // setDfsResult(Array.from(london.dfs(start, end)));
        }}
      >
        <label htmlFor="starting-station">Start station:</label>
        <input
          list="stations"
          id="starting-station"
          name="starting-station"
          onChange={(e) => setStartStation(e.target.value)}
        />
        <p>
          <label htmlFor="end-station">Destination:</label>
          <input
            list="stations"
            id="end-station"
            name="end-station"
            onChange={(e) => setEndStation(e.target.value)}
          />
        </p>
        <datalist id="stations">
          {stations.map((station) => (
            <option key={station.commonName} value={station.commonName} />
          ))}
        </datalist>
        <input type="submit" value="Find path" />
      </form>
      <div style={{ display: 'flex' }}>
        {result && (
          <div style={{ flex: '50% 1 1' }}>
            <Result
              result={result}
              zoneOneStart={zoneOneStart ? startStation : null}
              zoneOneEnd={zoneOneEnd ? endStation : null}
            />
          </div>
        )}
        {dfs && dfsResult && (
          <div style={{ flex: '50% 1 1' }}>
            <div>{dfsResult.length}</div>
            {dfsResult.map((station) => (
              <div key={station.value.commonName}>
                {station.value.commonName}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
