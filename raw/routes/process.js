const fs = require('fs');

const dlr = require('./dlr');
const central = require('./central');
const bakerloo = require('./bakerloo');
const circle = require('./circle');
const district = require('./district');
const hammersmith = require('./hammersmith');
const jubilee = require('./jubilee');
const metropolitan = require('./metropolitan');
const northern = require('./northern');
const overground = require('./overground');
const piccadilly = require('./piccadilly');
const victoria = require('./victoria');
const stations = require('../../data/stations');



const constructRoutes = (routes, line) =>{

return routes.map((route) => {
    return {
        name: route.name,
        line,
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

const allRoutes = constructRoutes(dlr.orderedLineRoutes, 'dlr').concat(constructRoutes(central.orderedLineRoutes, 'central'))
.concat(constructRoutes(bakerloo.orderedLineRoutes, 'bakerloo')).concat(constructRoutes(circle.orderedLineRoutes, 'circle'))
.concat(constructRoutes(district.orderedLineRoutes, 'district')).concat(constructRoutes(hammersmith.orderedLineRoutes, 'hammersmith'))
.concat(constructRoutes(jubilee.orderedLineRoutes, 'jubilee')).concat(constructRoutes(metropolitan.orderedLineRoutes, 'metropolitan')).concat(constructRoutes(northern.orderedLineRoutes, 'northern'))
.concat(constructRoutes(overground.orderedLineRoutes, 'overground')).concat(constructRoutes(piccadilly.orderedLineRoutes, 'piccadilly')).concat(constructRoutes(victoria.orderedLineRoutes, 'victoria'));

console.log(allRoutes);

fs.writeFileSync('data/routes.js', `module.exports = ${JSON.stringify(allRoutes)}`);
