var zipcodes = require('zipcodes');
var csv = require('csv-parser')
var fs = require('fs')


var dictWeight = {};

function readCSV (next) {
   fs.createReadStream('fedexGround.csv')
      .pipe(csv())
      .on('end',   function () { next(); } )
      .on('data', function (data) {
        //console.log('weight: %s Zone 8: %s', data.weight, data.z8)
        var weight = parseInt (data.weight);
        var pricesForWeight = [
            parseFloat (data.z2),
            parseFloat (data.z3),
            parseFloat (data.z4),
            parseFloat (data.z5),
            parseFloat (data.z6),
            parseFloat (data.z7),
            parseFloat (data.z8)
        ];
        dictWeight[weight] = pricesForWeight;
      })
}


function fedexPrice (weight, zone) {
   if (weight <1.0) return undefined;
   if (weight >150.0) return undefined;
   return dictWeight[weight][zone-2];
}




function fedexZone (distance) {
    if (distance <= 150.0) return 2;
    if (distance <= 300.0) return 3;
    if (distance <= 600.0) return 4;
    if (distance <= 1000.0) return 5;
    if (distance <= 1400.0) return 6;
    if (distance <= 1800.0) return 7;
    return 8;
}

function printInfo (clientZipCode, weight, clientInfo) {
    var zipRedstag = 37914;
    var dist = zipcodes.distance(zipRedstag, clientZipCode); //In Miles
    var zone = fedexZone(dist);
    var price = fedexPrice (weight, zone);
    console.log (`distance to ${clientInfo} is: ${dist} miles; this is fedex Zone ${zone} for ${weight} lb the fedexGround Price is: ${price}.`);
}



readCSV( () => {
    printInfo (78230, 2.0, "Texas-SanAntonio");
});
