var fs = require("fs");
var helper = require ("../helper.js");


function loadJson (fn) {
    var contents = fs.readFileSync(fn);
    // Define to JSON type
    var jsonContent = JSON.parse(contents);
    return jsonContent;
}

function testDelivery () {
    var delivery = loadJson("./testData/deliveryBrushes.json");
    //console.log(delivery);
    console.log (helper.DeliverySKUsummary(delivery) );
    console.log (helper.DeliveryWeight(delivery) );
}

 
testDelivery();