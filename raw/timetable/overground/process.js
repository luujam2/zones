const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { route } = require('next/dist/server/router');

let stnmappings = {};
async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'RJTTF301.MCA'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
    terminal: false
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let isOverground = false;
//   let isBSValid = false;
  let routes = [];
  let currentRoute = {};
// let debug = null;
// let debugFrom = null;
// var logger = fs.createWriteStream('log.txt', {
//   flags: 'a' // 'a' means appending (old data will be preserved)
// })

  for await (const line of rl) {

if(line.slice(0,2) === 'TI') {
    stnmappings[line.slice(2,9).trim()] = line.slice(18,44).trim();
}

// if(line.slice(0,2) === 'BS') {
//     const convertToDate = (yymmdd) => {
//         const year = yymmdd.slice(0,2);
//         const month = yymmdd.slice(2,4);
//         const day = yymmdd.slice(4,6);

//         if(Number(year) > 22) {
//             return new Date(`${month}/${day}/19${year}`);
//         } else {
//             return new Date(`${month}/${day}/20${year}`)
//         }
//     }
//     const dateFrom = convertToDate(line.slice(9,15));
    
//     const dateTo = convertToDate(line.slice(15,21));
// const currentDate = new Date();
//     if((currentDate.getTime() <= dateTo.getTime() && currentDate.getTime() >= dateFrom.getTime()) || currentDate.getTime() < dateFrom.getTime()) {

//         isBSValid = true;
//         debug = null;
//         debugFrom = null;       
//     } else {
//         isBSValid = false;
//         debug = dateTo;
//         debugFrom = dateFrom;

//     }
// }

if (line.includes('BX         LOYLO')) {
        // console.log(`Line from file: ${line}`);
        isOverground = true;
    } else if(line.slice(0,2) === 'BX' && line.slice(11,16) !== 'LOYLO' && line.slice(0,2) !== 'BS') {
        isOverground = false;
    } else if(isOverground && (line.slice(0,2) !== 'BS')) {
        const stop = stnmappings[line.slice(2, 9).trim()];
        const scheduledDepTime = line.slice(10,14).trim();
        const publicDepTime = line.slice(15,19).trim();
        const platform = line.slice(19,21).trim();
        
const stationType = line.slice(0,2);
        
        if(scheduledDepTime !== '' && publicDepTime !== '') {
            if(stationType === 'LO' || stationType === 'LI' || stationType === 'LT') {
             currentRoute.stations = [...(currentRoute.stations ?? []), stop];
             currentRoute[stop] = [...(currentRoute[stop] ?? []), publicDepTime];
            }

            if(stationType === 'LO') {
                currentRoute.start = stop;
            }
            if(stationType === 'LT') {
                currentRoute.end = stop;
                

                if(currentRoute.start) {
                    routes.push(currentRoute);
                    currentRoute = {}
                }
            }

            

            // if(stationType === 'CR') {
            //     currentRoute.change = stop;
            // }
            
            //logger.write(`\n${stop} ${scheduledDepTime} ${publicDepTime} ${platform}`)
        }
        
    }
  }

  const consolidatedRoutes = routes.reduce((acc, curr) => {
const matchingRoute = acc.find((val) => JSON.stringify(val.stations) === JSON.stringify(curr.stations));
const matchingRouteIndex = acc.findIndex((val) => JSON.stringify(val.stations) === JSON.stringify(curr.stations));

if(matchingRoute) {
    acc.splice(matchingRouteIndex, 1);

    const mergedRoute = {};
    for (const [key, value] of Object.entries(matchingRoute)) {
     
        if(Array.isArray(value) && key !== 'stations') {
            // if(curr.start === 'SOUTH TOTTENHAM' && curr.end === 'GOSPEL OAK') {
            //     console.log('key-----', curr['stations'], matchingRoute['stations']);
            // }

            mergedRoute[key] = [...new Set([...value, ...(curr[key] ?? [])].sort((a, b) => Number(a) - Number(b)))];
        } else {
            mergedRoute[key] = value;
        }
    }

    return [
        ...acc,
        mergedRoute,
    ]
}

return [
    ...acc,
    curr
]
  }, []);

  fs.writeFileSync('data/timetable/overground.js', `module.exports = ${JSON.stringify(consolidatedRoutes)}`);

}

processLineByLine();