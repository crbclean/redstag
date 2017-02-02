var fedex = require ("./fedexcost.js");


function printInfo (clientZipCode, weight, clientInfo) {
    var data = fedex.fedexCost (clientZipCode, weight);
    console.log (`distance to ${clientInfo} is: ${data.distance} miles; this is fedex Zone ${data.zone} for ${weight} lb the fedexGround Price is: ${data.price}.`);
}


fedex.readCSV( () => {
    printInfo (78230, 2.0, "Texas-SanAntonio");
});
