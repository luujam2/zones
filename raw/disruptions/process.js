const disruptions = require('./strike-disruptions');

const dr = new Set([...disruptions.map((disruption) => {
    return disruption.description.replace(/\r\n/g, '').trim();
})]);

console.log(dr);