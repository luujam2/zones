import React, { useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, motion, useCycle } from 'framer-motion';
import { colourList } from './utils';
import { GraphNode } from './node';
import { Edge, Station } from './app';

const maxJourneyTimes: { [key: string]: number[] } = {
  '2-3': [100, 110, 120], //travel between zones 2 and 3

  '1': [70, 80, 85], //travel across 1 zone
  '2': [80, 90, 100],
  '3': [90, 100, 110],
  '4': [100, 110, 120], //travel across 4 zones
  '5': [110, 125, 135], //travel across 5 zones
  '6': [120, 135, 145],
  '7': [130, 145, 160],
  '8': [140, 155, 170],
  '9': [150, 165, 180],
};

const pinkReaders = [
  'Blackhorse Road',
  'Canada Water',
  'Clapham Junction',
  'Gospel Oak',
  'Gunnersbury',
  'Hackney Central',
  'Hackney Downs',
  'Highbury & Islington',
  'Kensington (Olympia)',
  'Rayners Lane',
  'Richmond',
  'Stratford',
  'Surrey Quays',
  'West Brompton',
  'Whitechapel',
  'Willesden Junction',
  'Wimbledon',
];

const Row = styled.div`
  display: flex;
  justify-content: center;
`;

const Name = styled.div`
  flex: 0 0 20%;

  @media (max-width: 500px) {
    flex: 0 0 50%;
  }
`;

const MainName = styled(Name)`
  font-weight: bold;
`;

const Line = styled.div<{ line: string }>`
  flex: 0 0 auto;
  min-height: 50px;
  border-left: 12px solid ${(props) => colourList[props.line]};
`;

const StyledStation = styled.div<{ start: boolean }>`
  align-self: ${(props) => (props.start ? 'flex-end' : 'flex-start')};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid black;
  margin: 0 5px;
  background-color: white;
  z-index: 1;
`;

const Journey = styled.div`
  padding-bottom: 20px;
`;

const DottedLine = styled.div`
  flex: 0 0 auto;
  height: 50px;
  border-left: 12px dashed black;
`;

const Stop = styled.div`
  padding: 10px 0;
`;

const PinkReader = styled.span`
  display: inline-block;
  border: 1px solid pink;
  background-color: yellow;
  color: blue;
  border-radius: 21px;
  padding: 5px;
  font-size: 10px;
`;

const ZoneOne = styled.div`
  display: flex;
  justify-content: center;
  padding: 5px 0;
`;

const variants = {
  open: () => ({
    height: 'auto',
    opacity: 1,
  }),
  closed: {
    height: 0,
    opacity: 0,
  },
};

const Trip = ({ start, end, line, stations }: StationPairs) => {
  const [isOpen, toggleOpen] = useCycle(false, true);

  return (
    <Journey>
      <Row>
        <MainName>{start}</MainName>
        <StyledStation start={true} />
      </Row>
      <Row>
        <Name>
          {line === 'osi' ? (
            <sub>Out of station interchange</sub>
          ) : (
            <>
              {stations.length > 1 ? (
                <button onClick={() => toggleOpen()}>
                  <sub>
                    {isOpen ? 'Hide' : 'See'} {`stops (${stations.length})`}
                  </sub>
                </button>
              ) : (
                <sub>1 stop</sub>
              )}

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={variants}
                    transition={{
                      duration: 0.5,
                      ease: [0.04, 0.62, 0.23, 0.98],
                    }}
                  >
                    {stations.map((stn) => (
                      <Stop key={stn.value.commonName}>
                        {stn.value.commonName}
                      </Stop>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </Name>
        {line === 'osi' ? (
          <DottedLine title={line} />
        ) : (
          <Line title={line} line={line ?? ''} />
        )}
      </Row>
      <Row>
        <MainName>
          {end}{' '}
          {pinkReaders.includes(end ?? '') && (
            <PinkReader>Pink reader</PinkReader>
          )}
        </MainName>
        <StyledStation start={false} />
      </Row>
    </Journey>
  );
};

const findMaxJourneyTime = (zones: string[]) => {
  const zonesCrossed = [
    ...new Set(
      zones.map((zone, index) => {
        const splitZone = zone.split(/\+|\//);
        if (splitZone.length > 1) {
          //station is multi zone. determine which zone it is based on next station
          if (zones[index + 1] != null) {
            //if next zone is same or higher than higher zone use the higher zone in the split
            if (Number(zones[index + 1]) >= Number(splitZone[1])) {
              return Number(splitZone[1]);
            } else {
              //next zone is lower, use lower zone in the split
              return Number(splitZone[0]);
            }
          }

          //split zone is last station in list. look at previous station to determine which zone it is
          if (Number(zones[index - 1]) >= Number(splitZone[1])) {
            //previous zone is higher or same than higher split zone, e.g. zone 5 -> 4/5. use higher split zone
            return Number(splitZone[1]);
          }

          return Number(splitZone[0]);
        }

        return Number(zone);
      })
    ),
  ];

  const highestZone = Math.max(...zonesCrossed);
  const lowestZone = Math.min(...zonesCrossed);

  const currentDate = new Date();

  let journeyTimes: number[] = [];
  if (highestZone === 3 && lowestZone === 2) {
    journeyTimes = maxJourneyTimes['2-3'];
  } else {
    journeyTimes = maxJourneyTimes[`${zonesCrossed.length}`];
  }

  switch (currentDate.getDay()) {
    case 0: //sunday
      return journeyTimes[2];
    case 6:
      return journeyTimes[1];
    default:
      if (currentDate.getHours() > 19) {
        return journeyTimes[1];
      } else {
        return journeyTimes[0];
      }
  }
};

type ResultProps = {
  result: (
    | ({
        number: number | null;
      } & {
        node: [GraphNode<Station, Edge>, Edge | null] | null;
      })
    | undefined
  )[];
  zoneOneStart: string | null;
  zoneOneEnd: string | null;
};

type StationPairs = {
  start: string | undefined;
  end: string | undefined;
  line: string | undefined;
  stations: GraphNode<Station, Edge>[];
};

export default ({ result, zoneOneStart, zoneOneEnd }: ResultProps) => {
  const data = result.map((res) => res?.node);

  const findNextChange = (index: number, currentLine: string | undefined) => {
    return data.find((_, i) => {
      return i > index && currentLine !== data[i + 1]?.[1]?.line;
    });
  };

  const stationChangePairs: StationPairs[] = useMemo(
    () =>
      data.reduce<StationPairs[]>((acc, curr, index) => {
        const stn = curr?.[0];
        const line = curr?.[1];
        //is station before it a different line?
        //if yes then it is the end of one line and start of the next
        //if station is first then it is the start of the line
        if (index === data.length - 1 || stn == null) {
          return acc;
        }

        const isStationChange =
          data[index + 1]?.[1]?.line !== line?.line &&
          index !== data.length - 1;
        if (index === 0 || isStationChange) {
          const nextChange = findNextChange(index, data[index + 1]?.[1]?.line);

          return [
            ...acc,
            {
              start: stn?.value.commonName,
              end: nextChange?.[0]?.value?.commonName,
              line: nextChange?.[1]?.line,
              stations: [],
            } as StationPairs,
          ];
        } else {
          acc[acc.length - 1].stations.push(stn);
          return acc;
        }
      }, []),
    [result]
  );

  const zones: string[] = useMemo(
    () =>
      data.reduce<string[]>((acc, curr) => {
        const stn = curr?.[0];

        if (
          acc[acc.length - 1] !== stn?.value.zone &&
          stn?.value.zone != null
        ) {
          return [...acc, stn?.value.zone];
        }

        return acc;
      }, []),
    [data]
  );

  const maxJourneyTime: number = useMemo(
    () => findMaxJourneyTime(zones),
    [zones]
  );

  if (!stationChangePairs?.length) {
    return <Row>Journey not possible</Row>;
  }

  return (
    <>
      <p>
        <Row>{data.length} stops</Row>
        <Row>
          Max journey time allowed:{' '}
          {`${Math.floor(maxJourneyTime / 60)} hours ${
            maxJourneyTime % 60
          } minutes`}
        </Row>
      </p>
      {zoneOneStart && <ZoneOne>Walk from {zoneOneStart}</ZoneOne>}
      {stationChangePairs.map((pairs, index) => {
        return <Trip key={index} {...pairs} />;
      })}
      {zoneOneEnd && <ZoneOne>Walk to {zoneOneEnd}</ZoneOne>}
    </>
  );
};
