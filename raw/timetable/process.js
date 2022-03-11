const routes = require('../../data/routes');
const stations = require('../../data/stations');
const overgroundTimetable = require('../../data/timetable/overground');
const fs = require('fs')
const nameToMapKey = (commonName) => {
    if(typeof commonName !== 'string') {
        console.log('wtf', commonName)
    }

    return commonName
      .replace('Rail', '')
      .replace('Station', '')
      .replace('Underground', '')
      .replace('DLR', '')
      .replace('Dlr', '')
      .replace(/\(.+\)/, '')
      .replace('Stn / H&C and Circle Lines', '')
      .replace('Stn', '')
      .replace('St.', 'St')
      .replace("s's", 's')
      .replace('Shepherds', "Shepherd's")
      .replace('Paddington - ', 'Paddington')
      .replace('Queens Park', "Queen's Park")
      .replace('StPancras', 'St Pancras')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/&/g, '')
      .replace(/-/g, '')
      .replace(/'/g, '')
      .trim();
  };

  const getId = (ids, line) => {
    if (ids.length === 1) {
      return ids[0];
    }

    if (line === 'dlr') {
      return ids.find((id) => id.includes('940GZZDL'));
    }

    if (line === 'overground') {
      return ids.find((id) => id.includes('910G'));
    }

    if(line === 'circle') {
      return ids.find((id) => id.slice(id.length-1) === 'C');
    }

    if(line === 'district') {
      const id = ids.find((id) => id.slice(id.length-1) === 'C');

      if(id) {
        return id;
      }
    }

    return ids.find((id) => id.includes('940GZZLU'));
  };

  var glob = require( 'glob' )
  , path = require( 'path' );

let intervals = [];

glob.sync( __dirname + '/tfl-data/*.js' ).forEach( function( file ) {
  const data = require( path.resolve( file ) );

  data.timetable.routes.forEach((route) => {
      route.stationIntervals.forEach((stationInt) => {
        intervals.push([{stopId: data.timetable.departureStopId, timeToArrival: 0},...stationInt.intervals])
      });
  });
});

console.log('no. of intervals', intervals.length);


let mergedStationsAndTimes = [];

routes.filter((route)=> {
  return route.line !== 'overground';
}).forEach((route) => {
    const line = route.line;
    const stationLength = route.stations.length;
    const startId = getId(stations.find((stn) => {
        return nameToMapKey(stn.commonName) === nameToMapKey(route.stations[0]);
    }).ids, line);

    const endId = getId(stations.find((stn) => {
        return nameToMapKey(stn.commonName) === nameToMapKey(route.stations[route.stations.length-1]);
    }).ids, line);

    const intervalToUse = intervals.find((interval, index) => {
        const isMatchingStart = interval[0].stopId === startId || interval[0].stopId === endId;
        const isMatchingEnd = interval[interval.length-1].stopId === endId || interval[interval.length-1].stopId === startId;
        const isMatchingLength = interval.length === stationLength;
            return isMatchingStart && isMatchingEnd && isMatchingLength;
    });

    if(intervalToUse) {
      const a = intervalToUse[0].stopId === startId;
      const b = intervalToUse[intervalToUse.length - 1].stopId === endId;

      if(a && b) {
        const data = route.stations.map((station, index) => {
          const nextStation = route.stations[index+1];
  
          if(nextStation) {
            return {
              name: station,
              time: intervalToUse[index+1].timeToArrival - intervalToUse[index].timeToArrival
            } 
            } else {
              return {
                name: station,
                time: 0
              }   
          }
        });
  
        mergedStationsAndTimes.push({
          ...route,
          stations: data
        })
      } else {
        const reversedInterval = intervalToUse.slice().reverse();

        const data = route.stations.map((station, index) => {
          const nextStation = route.stations[index+1];
  
          if(nextStation) {
            return {
              name: station,
              time: reversedInterval[index].timeToArrival - reversedInterval[index+1].timeToArrival
            } 
            } else {
              return {
                name: station,
                time: 0
              }   
          }
        });
  
        mergedStationsAndTimes.push({
          ...route,
          stations: data
        })

      }

      // console.log(data)
    }
});

const extraTransforms = (commonName) => {
  return commonName.replace(' AND ', '').replace('NLL', '').replace('ISLINGTON ELL', 'ISLINGTON').replace('PLATS 0-2', '').replace('DC', '')
}

const findNearestTrainTime = (time, timeSet) => {
  const formatTime = (ta) => new Date(`01/01/2000 ${ta.slice(0,2)}:${ta.slice(2,4)}`);

  const t1 = formatTime(time);
  const times = timeSet.map((ts) => {
    return formatTime(ts).getTime() - t1;
  }).filter((val) => val>0);
  const minTime = Math.min(...times);

  const res = Math.floor((minTime / 1000)/60);

  if(res === Infinity) {
console.log('WTF---', minTime, timeSet);
  }

  return res;
}

routes.filter((route) => route.line === 'overground').forEach((route) => {
  const possibleTimetables = overgroundTimetable.filter((timetable) => {
    return nameToMapKey(extraTransforms(timetable.start)) === nameToMapKey(route.stations[0]) && nameToMapKey(extraTransforms(timetable.end)) === nameToMapKey(route.stations[route.stations.length - 1]) && timetable.stations.length === route.stations.length; 
  });

  if(!possibleTimetables.length) {
    const reversedRoute = overgroundTimetable.filter((timetable) => {
      return nameToMapKey(extraTransforms(timetable.end)) === nameToMapKey(route.stations[0]) && nameToMapKey(extraTransforms(timetable.start)) === nameToMapKey(route.stations[route.stations.length - 1]) && timetable.stations.length === route.stations.length; 
    });

    if(reversedRoute.length) {
    const reversedStns = reversedRoute[0].stations.slice().reverse();
      const res = reversedStns.map((stn, index) => {
        
        const nextTrain = reversedStns[index+1];
  
        if(nextTrain == null) {
          return {
            name: route.stations[index],
            time: 0
          }
        }
  
  
  
        const firstTimeSet = reversedRoute[0][stn];
        const secondTime = reversedRoute[0][nextTrain][0];
  
        const duration = findNearestTrainTime(secondTime, firstTimeSet);
  
        return {
          name: route.stations[index],
          time: duration
        }
      });

      mergedStationsAndTimes.push({
        ...route,
        stations: res,
      })

    } else {
      console.log('issue----', route.name);
    }
  } else {
    const res = possibleTimetables[0].stations.map((stn, index) => {
      
      const nextTrain = possibleTimetables[0].stations[index+1];

      if(nextTrain == null) {
        return {
          name: route.stations[index],
          time: 0
        }
      }



      const firstTime = possibleTimetables[0][stn][0];
      const secondTimeSet = possibleTimetables[0][nextTrain];

      const duration = findNearestTrainTime(firstTime, secondTimeSet);

      return {
        name: route.stations[index],
        time: duration
      }
    });


    mergedStationsAndTimes.push({
      ...route,
      stations: res
    })
    // console.log(res)

  }
});
      //TODO for each overground route
      //TODO read from timetable/overground.js filter routes by start stations
      //if match, use first time to work out time to arrival

      fs.writeFileSync('data/route-with-times.js', `module.exports=${JSON.stringify(mergedStationsAndTimes)}`);