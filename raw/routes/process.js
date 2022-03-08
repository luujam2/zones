const fs = require('fs');

const dlrInbound = require('./inbound/dlr');
const centralInbound = require('./inbound/central');
const bakerlooInbound = require('./inbound/bakerloo');
const circleInbound = require('./inbound/circle');
const districtInbound = require('./inbound/district');
const hammersmithInbound = require('./inbound/hammersmith');
const jubileeInbound = require('./inbound/jubilee');
const metropolitanInbound = require('./inbound/metropolitan');
const northernInbound = require('./inbound/northern');
const overgroundInbound = require('./inbound/overground');
const piccadillyInbound = require('./inbound/piccadilly');
const victoriaInbound = require('./inbound/victoria');

const dlrOutbound = require('./outbound/dlr');
const centralOutbound = require('./outbound/central');
const bakerlooOutbound = require('./outbound/bakerloo');
const circleOutbound = require('./outbound/circle');
const districtOutbound = require('./outbound/district');
const hammersmithOutbound = require('./outbound/hammersmith');
const jubileeOutbound = require('./outbound/jubilee');
const metropolitanOutbound = require('./outbound/metropolitan');
const northernOutbound = require('./outbound/northern');
const overgroundOutbound = require('./outbound/overground');
const piccadillyOutbound = require('./outbound/piccadilly');
const victoriaOutbound = require('./outbound/victoria');
const stations = require('../../data/stations');



const constructRoutes = (routes, line, isInbound = false) =>{

return routes.map((route) => {
    return {
        name: route.name,
        line,
        direction: isInbound ? 'inbound' : 'outbound',
        stations: route.naptanIds.map((id) => {
            const station = stations.find((stn) => stn.ids.includes(id));
            if(!station) {
                ids.push(id);
            }

            return station?.commonName;
        })
    }
});
};

const allRoutesInbound = constructRoutes(dlrInbound.orderedLineRoutes, 'dlr', true).concat(constructRoutes(centralInbound.orderedLineRoutes, 'central', true))
.concat(constructRoutes(bakerlooInbound.orderedLineRoutes, 'bakerloo', true)).concat(constructRoutes(circleInbound.orderedLineRoutes, 'circle', true))
.concat(constructRoutes(districtInbound.orderedLineRoutes, 'district', true)).concat(constructRoutes(hammersmithInbound.orderedLineRoutes, 'hammersmith', true))
.concat(constructRoutes(jubileeInbound.orderedLineRoutes, 'jubilee', true)).concat(constructRoutes(metropolitanInbound.orderedLineRoutes, 'metropolitan', true))
.concat(constructRoutes(northernInbound.orderedLineRoutes, 'northern', true))
.concat(constructRoutes(overgroundInbound.orderedLineRoutes, 'overground', true)).concat(constructRoutes(piccadillyInbound.orderedLineRoutes, 'piccadilly', true))
.concat(constructRoutes(victoriaInbound.orderedLineRoutes, 'victoria', true));

const allRoutesOutBound = constructRoutes(dlrOutbound.orderedLineRoutes, 'dlr').concat(constructRoutes(centralOutbound.orderedLineRoutes, 'central'))
.concat(constructRoutes(bakerlooOutbound.orderedLineRoutes, 'bakerloo')).concat(constructRoutes(circleOutbound.orderedLineRoutes, 'circle'))
.concat(constructRoutes(districtOutbound.orderedLineRoutes, 'district')).concat(constructRoutes(hammersmithOutbound.orderedLineRoutes, 'hammersmith'))
.concat(constructRoutes(jubileeOutbound.orderedLineRoutes, 'jubilee')).concat(constructRoutes(metropolitanOutbound.orderedLineRoutes, 'metropolitan'))
.concat(constructRoutes(northernOutbound.orderedLineRoutes, 'northern'))
.concat(constructRoutes(overgroundOutbound.orderedLineRoutes, 'overground')).concat(constructRoutes(piccadillyOutbound.orderedLineRoutes, 'piccadilly'))
.concat(constructRoutes(victoriaOutbound.orderedLineRoutes, 'victoria'));


const allRoutes = allRoutesOutBound.concat(allRoutesInbound);
console.log(allRoutes);

fs.writeFileSync('data/routes.js', `module.exports = ${JSON.stringify(allRoutes)}`);
