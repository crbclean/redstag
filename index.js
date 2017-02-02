var rpc = require('jayson');
shortid = require('shortid');
var R = require ("ramda");
var async = require ("async");

// Redstag Fullfillment Api (www.redstagfullfilment.com)
// Documentation: http://docs.redstagfulfillment.com/

// Endpoints
var endpoint_prodcution = "https://redstagfulfillment.com/backend/api/jsonrpc";
var endpoint_sandbox = "https://redstagfulfillment.com/sandbox/api/jsonrpc";

var client = undefined;
var sessionKey = undefined;

function connect (user, apiKey, callback) {
    client = rpc.client.https( endpoint_prodcution);

    client.on ("request", (data) => {
        console.log("request sent.." + JSON.stringify (data));
    });


    client.request( "login", [user, apiKey, ],4444, function (err, response) {
        if (err) {
            console.log("redstag login error: " + err);
            callback (true);
        }
        else {
            console.log("redstag login response: " + JSON.stringify(response));
            sessionKey = response.result;
            console.log("redstag session key is: " + sessionKey);
            callback (false);
        }
    });
}


function clientrequest (method, methodparameter, callback) {
    var id = shortid.generate(); // a unique id
    var paramHeader = [sessionKey, method];
    var fullParameter = paramHeader.concat ([methodparameter]);
    //console.log("parameter extended: " + JSON.stringify(fullParameter));
    client.request ("call", fullParameter, id, callback );
}


// Order

// An order is a request from the merchant for an outbound shipment of the merchant’s inventory.
// Each order is closely tracked through picking and packing all of the way to the time it is placed on the carrier’s truck,
// even including which pallet the packages were loaded onto.
// When an order has begun picking it is split (if needed) into “Shipments” based on the most efficient way to meet carrier size and weight limitations.
// Each “shipment” therefore typically results in only one package although under some circumstances may still require more than one package.

// State       Statuses                              Meaning
// new         new, partial_backorder, backordered   Order received and inventory reserved.
// processing  processing, partial_backorder         Shipments created and assigned to a picking batch.
// complete    complete                              Entire order has been packaged and labeled for shipping.
// canceled    canceled                              Order has been canceled.
// holded      holded, delayed_shipment              Order is on hold.



function createOrder (orderItems, shippingAddress, orderAdditionalData, callback) {
    var storeCode = null;
    clientrequest( "order.create", [storeCode,orderItems,shippingAddress, orderAdditionalData], function (err, res) {
        if (err) {
            console.log(err);
            callback (err, "error - connectivity?");
        }
        else {
            if (res.error !== undefined) {
                console.log("createOrder error: " + res.error.message);
                callback (true, res.error.message);
            } else {
                console.log(res);
                callback (false, res.result);
            }
        }
    });
}

function queryAllOrders (callback) {
    var filter = null; // null means no filter
    var options = null; // null means no options
    var resultFields = "*"; // * equals to all fields
    clientrequest( "order.search", [filter,options,resultFields], function (err, res) {
        if (err) {
            console.log("queryAllOrders error: " + err);
            callback (true, []);
        }
        else {
            console.log("queryAllOrders: result: " + JSON.stringify(res));
            callback (false, res.result.results);
        }
    });
}



// Shipments are not created in the system until an order goes into picking.
// There may be multiple shipments for one order depending on the overall weight and number of items on the order.
// Although there may be more than one package for a single shipment, most shipments will have only one package.

// A packing slip will be printed for each shipment and if multiple packages are required for one shipment they will
// be linked to the same master tracking number if supported by the carrier.

function queryAllShipments () {
    var id = shortid.generate(); // a unique id
    var filter = null;
    var options = null;
    var resultFields = "*"; // * equals to all fields
    client.call( {"method": "shipment.search", "params": [filter,options,resultFields], "id": id}, function (err, res) {
        if (err) { console.log(err); }
        else { console.log(res); }
    });
}

// shipment.info

// shipment.track



// There may be multiple packages for one shipment.
// Each package may have multiple tracking numbers, most packages will have only one tracking number.

// package.search


function queryInventory () {
    var id = shortid.generate(); // a unique id

    var skuArray = null; // if skuArray is null, then all sku will be returned
    client.call( {"method": "inventory.list", "params": [skuArray], "id": id}, function (err, res) {
        if (err) { console.log(err); }
        else { console.log(res); }
    });
}


// rate.quote    (not yet available, according to documentation)


// fedexCost estimate

var fedex = require ("./fedexcost.js");

fedex.readCSV ( () => { console.log("fedex CSV data loaded."); } );
module.exports.readCSV = readCSV;
module.exports.fedexCost = fedex.fedexCost;


// Export

module.exports.connect = connect;

module.exports.queryAllOrders = queryAllOrders;
module.exports.createOrder = createOrder;

module.exports.queryAllShipments = queryAllShipments;

module.exports.queryInventory = queryInventory;
