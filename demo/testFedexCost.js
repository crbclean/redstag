var fedex = require ("./fedexcost.js");


function printInfo (clientZipCode, weight, clientInfo) {
    var data = fedex.fedexCost (clientZipCode, weight);
    console.log (`distance to ${clientInfo} is: ${data.distance} miles; this is fedex Zone ${data.zone} for ${weight} lb the fedexGround Price is: ${data.price}. USD/lb:${data.usdperlb}`);
}


fedex.readCSV( () => {
    printInfo (78230, 2.0, "Texas-SanAntonio");
    printInfo (78230, 231.4, "Texas-SanAntonio"); // test multiple packets (150 lb + 81.4 lb)
    printInfo (90049, 2.0, "LosAngeles BellAir");
    printInfo (90049, 231.4, "LosAngeles BellAir");
});

