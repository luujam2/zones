import React, { useState } from 'react';
import { Graph } from './graph';
import { Edge, nameToMapKey, Station } from './main';
import Result from './result';

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

  const dfs = false;
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const res = london.dijkstras(
            stationMappings[nameToMapKey(startStation)],
            stationMappings[nameToMapKey(endStation)]
          );

          setResult(Array.from(res));

          setDfsResult(
            Array.from(
              london.dfs(
                stationMappings[nameToMapKey(startStation)],
                stationMappings[nameToMapKey(endStation)]
              )
            )
          );
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
            <Result result={result} />
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
