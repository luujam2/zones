import type { NextApiRequest, NextApiResponse } from 'next';
// use stations data to look up id of line
// use api /ids/arrivals/stoppointid. work out id to use from array of station ids
// use destination station id based on route final stop (look up id from array of ids + line taken)
import { APP_KEY } from './path';
export type Arrival = {
  platformName: string;
  timeToStation: number;
  direction: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Arrival[]>
) {
  const id = req.query.id;
  const stopPointId = req.query.stopPointId;
  const direction = req.query.direction;

  const data = await fetch(
    `https://api.tfl.gov.uk/Line/${id}/Arrivals/${stopPointId}?direction=all&app_key=${APP_KEY}`
  );

  const result: Arrival[] = await data.json();

  const sortedResult = result.sort((a, b) => a.timeToStation - b.timeToStation);

  const filteredByDirection = sortedResult.filter((res) => {
    return res.direction === direction;
  });

  if (filteredByDirection.length === 0) {
    return res.status(200).json(sortedResult.slice(0, 3));
  }

  res.status(200).json(filteredByDirection.slice(0, 3));
}
