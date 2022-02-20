import React, { useState } from 'react';
import { Graph } from './graph';
import { Edge, nameToMapKey, Station } from './main';

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
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const res = london.dijkstras(
            stationMappings[nameToMapKey(startStation)],
            stationMappings[nameToMapKey(endStation)]
          );

          const r = [];
          res.forEach((item) => {
            r.push(item.value.commonName);
          });
          setResult(r);
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
      {result && (
        <div>
          {result.map((stn) => {
            return <div>{stn}</div>;
          })}
        </div>
      )}
    </>
  );
};
