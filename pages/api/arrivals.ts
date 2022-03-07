import type { NextApiRequest, NextApiResponse } from 'next';
// use stations data to look up id of line
// use api /ids/arrivals/stoppointid. work out id to use from array of station ids
// use destination station id based on route final stop (look up id from array of ids + line taken)
import { APP_KEY } from './path';
export type Arrival = {
  platformName: string;
  timeToStation: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Arrival[]>
) {
  const id = req.query.id;
  const stopPointId = req.query.stopPointId;
  const destinationId = req.query.destinationId;

  const data = await fetch(
    `https://api.tfl.gov.uk/Line/${id}/Arrivals/${stopPointId}?direction=all&destinationStationId=${destinationId}&app_key=${APP_KEY}`
  );

  const result = await data.json();

  res.status(200).json(result);
}
