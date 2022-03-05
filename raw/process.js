const fs = require('fs');

const dlr = require('./dlr');
const overground = require('./overground');
const tube = require('./tube');
// import aaa from './overground';


const normaliseName = (stn) => {
  return stn
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
        .trim();
}

const constructProcessedData = (a) => {
  const obj = a.filter((stoppoint) => stoppoint.stopType === 'NaptanMetroStation' || stoppoint.stopType === 'NaptanRailStation').reduce((acc, curr) => {

    const stnName = normaliseName(curr.commonName);
    if(stnName.includes('Clapham')){
      console.log('ok!....', stnName);
    }
    
    if(acc[stnName]) {
      return {
        ...acc,
        [stnName]: {
          ...acc[stnName],
          zone: acc[stnName].zone ?? curr.zone,
          modes: [...new Set([...acc[stnName].modes, ...curr.modes ])],
          ids: [...acc[stnName].ids, curr.id]
        }
      }
    }

    return {
      ...acc,
      [stnName]: {
        commonName: stnName,
        modes: curr.modes,
        ids: [curr.id],
        zone: curr.additionalProperties.find((x) => x.key === 'Zone')?.value,
        lat: curr.lat,
        lon: curr.lon
      }
    };
  }, {});
  const arrayUniqueByKey = Object.values(obj);
  
  // fs.writeFileSync(filename, `module.exports = ${JSON.stringify(arrayUniqueByKey)}`);
  // console.log(JSON.stringify(arrayUniqueByKey));  
  return arrayUniqueByKey;
}

const data = constructProcessedData(dlr.stopPoints.concat(overground.stopPoints).concat(tube.stopPoints));


const array = data
    .sort((a, b) => {
    if (a.commonName < b.commonName) {
      return -1;
    }
    if (a.commonName > b.commonName) {
      return 1;
    }
    return 0;
  });

  fs.writeFileSync('data/stations.js', `module.exports = ${JSON.stringify(array)}`);