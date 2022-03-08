import type { NextApiRequest, NextApiResponse } from 'next';
// use stations data to look up id of line
// use api /ids/arrivals/stoppointid. work out id to use from array of station ids
// use destination station id based on route final stop (look up id from array of ids + line taken)
import { APP_KEY } from './path';
export type Arrival = {
  platformName: string;
  timeToStation: number;
  direction: string;
  destinationNaptanId: string;
};

export type OvergroundArrival = {
  departureStatus: string;
  destinationName: string;
  destinationNaptanId: string;
  estimatedTimeOfArrival: string;
  minutesAndSecondsToArrival: string;
  minutesAndSecondsToDeparture: string;
  naptanId: string;
  platformName: string;
  scheduledTimeOfArrival: string;
  stationName: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Arrival[]>
) {
  const id = req.query.id;
  const stopPointId = req.query.stopPointId;
  const direction = req.query.direction;
  const destinationId = req.query.destinationId;

  if (stopPointId.includes('910G')) {
    const data = await fetch(
      `https://api.tfl.gov.uk/StopPoint/${stopPointId}/ArrivalDepartures?lineIds=london-overground`
    );
    const result: OvergroundArrival[] = await data.json();

    const upcomingDepartures: Arrival[] = result
      .filter(
        (res) =>
          res.minutesAndSecondsToDeparture !== '' &&
          res.destinationNaptanId === destinationId
      )
      .map((res) => {
        const [minutes, seconds] = res.minutesAndSecondsToDeparture.split(':');
        const totalSeconds = Number(minutes) * 60 + Number(seconds);
        return {
          platformName: res.platformName,
          timeToStation: totalSeconds,
          destinationNaptanId: res.destinationNaptanId,
          direction: direction as string,
        };
      })
      .sort((a, b) => a.timeToStation - b.timeToStation)
      .slice(0, 3);

    return res.status(200).json(upcomingDepartures);
  }

  const data = await fetch(
    `https://api.tfl.gov.uk/Line/${id}/Arrivals/${stopPointId}?direction=${direction}&destinationStationId=${destinationId}&app_key=${APP_KEY}`
  );

  const result: Arrival[] = await data.json();

  const sortedResult = result.sort((a, b) => a.timeToStation - b.timeToStation);

  if (sortedResult.length === 0) {
    return res.status(200).json([]);
  }

  res.status(200).json(sortedResult.slice(0, 3));
}
