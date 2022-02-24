const fs = require('fs');

const dlr = require('./dlr');
const overground = require('./overground');
const tube = require('./tube');
// import aaa from './overground';


const constructProcessedData = (a, filename) => {
  const array = a.stopPoints.map((b) => {
    return {
      commonName: b.commonName,
      modes: b.modes,
      id: b.id,
      zone: b.additionalProperties.find((x) => x.key === 'Zone')?.value,
      lat: b.lat,
      lon: b.lon
    };
  });
  const arrayUniqueByKey = [
    ...new Map(array.map((item) => [item['commonName'], item])).values(),
  ];
  
  fs.writeFileSync(filename, `module.exports = ${JSON.stringify(arrayUniqueByKey)}`);
  console.log(JSON.stringify(arrayUniqueByKey));  
  return arrayUniqueByKey;
}

const dlrData = constructProcessedData(dlr, 'data/dlr.js');
const overgroundData = constructProcessedData(overground, 'data/overground.js');
const tubeData = constructProcessedData(tube, 'data/tube.js');


const array = overgroundData
  .concat(dlrData)
  .concat(tubeData)
  .filter((stn) => stn.zone != null)
  .map((stn) => {
    return {
      ...stn,
      commonName: stn.commonName
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
        .trim(),
    };
  })
  .sort((a, b) => {
    if (a.commonName < b.commonName) {
      return -1;
    }
    if (a.commonName > b.commonName) {
      return 1;
    }
    return 0;
  });

  const arrayUniqueByKey = [
    ...new Map(array.map((item) => [item['commonName'], item])).values(),
  ];


  fs.writeFileSync('data/stations.js', `module.exports = ${JSON.stringify(arrayUniqueByKey)}`);