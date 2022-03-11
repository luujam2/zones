import React, { useState } from 'react';
import stations from '../data/stations';

import useSWR from 'swr';
import Filter from './filter';
import Search from './search';
import { nameToMapKey, PathResp } from '../pages/api/path';
import styled from '@emotion/styled';
import Spinner from './spinner';
import Result from './result';

export const fetcher = (args: any) => fetch(args).then((res) => res.json());

const CenteredSpin = styled.div`
  display: flex;
  justify-content: center;
`;

export type Station = {
  commonName: string;
  modes: string[];
  zone?: string;
  lat: number;
  lon: number;
  ids: string[];
};

export type Edge = {
  line: string;
  route: string;
  weight?: number;
  direction: string;
};

export type Connections = {
  [key: string]: {
    connections: { name: string; line: string }[];
  };
};

const validStations = stations.map((stn) => stn.commonName);

export default () => {
  const [filter, setFilter] = useState<string[]>([]);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [shouldFetch, setShouldFetch] = useState(false);

  const shouldFetchData =
    shouldFetch &&
    start &&
    end &&
    validStations.includes(start) &&
    validStations.includes(end);

  const { data: results, error } = useSWR<PathResp[]>(
    () =>
      shouldFetchData
        ? `/api/path?start=${nameToMapKey(start)}&end=${nameToMapKey(end)}${
            filter.length ? `&filter=${filter.join(',')}` : ''
          }`
        : null,
    fetcher
  );
  return (
    <>
      <Filter
        lines={[
          'dlr',
          'overground',
          'piccadilly',
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
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
        setShouldFetch={setShouldFetch}
      />

      {error && <div>Unable to complete request</div>}
      {results === undefined && shouldFetchData && !error ? (
        <CenteredSpin>
          <Spinner />
        </CenteredSpin>
      ) : (
        results &&
        !error && (
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '50% 1 1' }}>
              <Result
                result={results}
                zoneOneStart={
                  results[0]?.value?.commonName !== start ? start : null
                }
                zoneOneEnd={
                  results[results.length - 1]?.value?.commonName !== end
                    ? end
                    : null
                }
              />
            </div>
          </div>
        )
      )}
    </>
  );
};
