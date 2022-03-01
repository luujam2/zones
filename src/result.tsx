import React, { useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, motion, useCycle } from 'framer-motion';
import { colourList } from './utils';

const maxJourneyTimes = {
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

const Station = styled.div<{ start: boolean }>`
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

const Trip = ({
  start,
  end,
  line,
  stations,
}: {
  start: string;
  end: string;
  line: keyof typeof colourList;
  stations: any;
}) => {
  const [isOpen, toggleOpen] = useCycle(false, true);

  return (
    <Journey>
      <Row>
        <MainName>{start}</MainName>
        <Station start={true} />
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
          <Line title={line} line={line} />
        )}
      </Row>
      <Row>
        <MainName>
          {end}{' '}
          {pinkReaders.includes(end) && <PinkReader>Pink reader</PinkReader>}
        </MainName>
        <Station start={false} />
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

  let journeyTimes = [];
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

export default ({ result, zoneOneStart, zoneOneEnd }) => {
  const data = result.map((res) => res.node);

  const findNextChange = (index, currentLine) => {
    return data.find(([stn, line], i) => {
      return i > index && currentLine !== data[i + 1]?.[1].line;
    });
  };

  const stationChangePairs = useMemo(
    () =>
      data.reduce((acc, [stn, line], index) => {
        //is station before it a different line?
        //if yes then it is the end of one line and start of the next
        //if station is first then it is the start of the line
        if (index === data.length - 1) {
          return acc;
        }

        const isStationChange =
          data[index + 1]?.[1].line !== line?.line && index !== data.length - 1;
        if (index === 0 || isStationChange) {
          const nextChange = findNextChange(index, data[index + 1]?.[1].line);

          return [
            ...acc,
            {
              start: stn.value.commonName,
              end: nextChange?.[0]?.value?.commonName,
              line: nextChange?.[1].line,
              stations: [],
            },
          ];
        } else {
          acc[acc.length - 1].stations.push(stn);
          return acc;
        }
      }, []),
    [result]
  );

  const zones = useMemo(
    () =>
      data.reduce((acc, [stn, line], index) => {
        if (acc[acc.length - 1] !== stn.value.zone) {
          return [...acc, stn.value.zone];
        }

        return acc;
      }, []),
    [data]
  );

  const maxJourneyTime: number = useMemo(
    () => findMaxJourneyTime(zones),
    [zones]
  );

  if (!stationChangePairs.length) {
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
