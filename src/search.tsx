import React, { useEffect, useState } from 'react';
import { Graph } from './graph';
import { Edge, nameToMapKey, Station } from './app';
import Result from './result';
import useSWR, { Fetcher } from 'swr';
import Spinner from './spinner';
import Input from './input';
import styled from '@emotion/styled';
const fetcher = (args) => fetch(args).then((res) => res.json());

const Form = styled.form``;

const FormItem = styled.p`
  display: flex;
  justify-content: center;
`;

const Submit = styled.input`
  font-size: 36px;
  min-width: 150px;
`;

const CenteredSpin = styled.div`
  display: flex;
  justify-content: center;
`;

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
  const [zoneOneStart, setZoneOneStart] = useState(null);
  const [zoneOneEnd, setZoneOneEnd] = useState(null);
  const [dijkstraStart, setDijkstraStart] = useState(null);
  const [dijkstraEnd, setDijkstraEnd] = useState(null);
  const { data: startData } = useSWR(
    () =>
      zoneOneStart
        ? `https://api.tfl.gov.uk/StopPoint/?lat=${zoneOneStart.lat}&lon=${zoneOneStart.lon}&stopTypes=NaptanMetroStation&radius=1500`
        : null,
    fetcher
  );

  const { data: endData } = useSWR(
    () =>
      zoneOneEnd
        ? `https://api.tfl.gov.uk/StopPoint/?lat=${zoneOneEnd.lat}&lon=${zoneOneEnd.lon}&stopTypes=NaptanMetroStation&radius=1500`
        : null,
    fetcher
  );

  // sets the start and end points to closest Z2 station if either are Z1
  useEffect(() => {
    const getNearestStation = (data, stn) => {
      const nearestZoneTwo = data.stopPoints.find((sp) => {
        if (!stationMappings[nameToMapKey(sp.commonName)]) {
          return false;
        }
        return (
          stationMappings[nameToMapKey(sp.commonName)]?.value?.zone !== '1'
        );
      });

      if (nearestZoneTwo) {
        return stationMappings[nameToMapKey(nearestZoneTwo.commonName)];
      }

      //find closest by euclidean distance
      const distance = (a, b) => {
        return Math.sqrt(
          Math.pow(b.lat - a.lat, 2) + Math.pow(b.lon - a.lon, 2)
        );
      };

      const station = stations
        .filter((station) => station.zone !== '1')
        .reduce((a, b) => (distance(stn, a) < distance(stn, b) ? a : b));

      return stationMappings[nameToMapKey(station.commonName)];
    };

    if (startData) {
      const closest = getNearestStation(startData, zoneOneStart);
      setDijkstraStart(closest);
    }

    if (endData) {
      const closest = getNearestStation(endData, zoneOneEnd);
      setDijkstraEnd(closest);
    }
  }, [startData, endData, stationMappings]);

  //runs the search whenever start, end, graph or mappings change
  useEffect(() => {
    if (dijkstraStart == null || dijkstraEnd == null) {
      return;
    }

    console.log('RUNNING RESULT WITH', dijkstraStart, dijkstraEnd);

    const res = london.dijkstras(
      stationMappings[nameToMapKey(dijkstraStart.value.commonName)],
      stationMappings[nameToMapKey(dijkstraEnd.value.commonName)]
    );
    setResult(Array.from(res));
  }, [dijkstraStart, dijkstraEnd, london, stationMappings]);

  console.log('start---', startData, endData);

  return (
    <>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          const start = stationMappings[nameToMapKey(startStation)];
          const end = stationMappings[nameToMapKey(endStation)];
          if (start.value.zone === '1') {
            setZoneOneStart(start.value);
          } else {
            setDijkstraStart(start);
          }

          if (end.value.zone === '1') {
            return setZoneOneEnd(end.value);
          } else {
            setDijkstraEnd(end);
          }
        }}
      >
        <FormItem>
          <Input
            id="start-station"
            label="Start station"
            onChange={(e) => {
              setZoneOneStart(false);
              setStartStation(e.target.value);
            }}
          />
        </FormItem>

        <FormItem>
          <Input
            id="end-station"
            label="Destination"
            onChange={(e) => {
              setZoneOneEnd(false);
              setEndStation(e.target.value);
            }}
          />
        </FormItem>
        <datalist id="stations">
          {stations.map((station) => (
            <option key={station.commonName} value={station.commonName} />
          ))}
        </datalist>
        <FormItem>
          <Submit type="submit" value="Go" />
        </FormItem>
      </Form>

      {(zoneOneStart && startData === undefined) ||
      (zoneOneEnd && endData === undefined) ? (
        <CenteredSpin>
          <Spinner />
        </CenteredSpin>
      ) : (
        result && (
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '50% 1 1' }}>
              <Result
                result={result}
                zoneOneStart={zoneOneStart ? startStation : null}
                zoneOneEnd={zoneOneEnd ? endStation : null}
              />
            </div>
          </div>
        )
      )}
    </>
  );
};
