var zipcodes = require('zipcodes');
var csv = require('csv-parser');
var fs = require('fs');
var path = require('path');

var dictWeight = {};

function readCSV (next) {
   //var fileName = 'fedexGround.csv';
   var fileName = path.join  (__dirname, 'fedexGround.csv');
   console.log("fileName: " + fileName);
   fs.createReadStream(fileName)
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
      });
}


function fedexPrice (weight, zone) {
   if (weight >150.0) return fedexPrice(150.0, zone) + fedexPrice(weight-150.0, zone);
   var roundedWeight = Math.round (weight); // only round number estimates in dictionary.
   if (roundedWeight <1.0) roundedWeight = 1.0;
   return dictWeight[roundedWeight][zone-2];
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

function fedexCost (clientZipCode, weight) {
    var zipRedstag = 37914;
    var data = {};
    data.distance = zipcodes.distance(zipRedstag, clientZipCode); //In Miles
    data.zone = fedexZone(data.distance);
    data.price = fedexPrice (weight, data.zone);
    data.usbperlb = data.price / weight;
    data.usdperlb = +data.usbperlb.toFixed( 2 ); // round to cents 
    return data;
}


module.exports = {
    readCSV,
    fedexCost
};
