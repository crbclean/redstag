var rpc = require('jayson');
shortid = require('shortid');
var R = require ("ramda");
var async = require ("async");

// Redstag Fullfillment Api (www.redstagfullfilment.com)
// Documentation: http://docs.redstagfulfillment.com/

// Endpoints
var endpoint_prodcution = "https://redstagfulfillment.com/backend/api/jsonrpc";
var endpoint_sandbox = "https://redstagfulfillment.com/sandbox/api/jsonrpc";


var isDebug = true;
function setDebug ( enabled ) {
    isDebug = enabled;
}


var client = undefined;
var sessionKey = undefined;

function connect (user, apiKey, callback) {
    client = rpc.client.https( endpoint_prodcution);

    client.on ("request", (data) => {
        if (isDebug) console.log("request sent.." + JSON.stringify (data));
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


// a helper function, to make a request to redstag; a wrapper around the  jayson rpc library
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
                //console.log(res);
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
            //console.log("queryAllOrders error: " + err);
            callback (true, []);
        }
        else {
            //console.log("queryAllOrders: result: " + JSON.stringify(res));
            callback (false, res.result.results);
        }
    });
}

function orderInfo (redstagOrderId, callback) {
    var resultFields = "*"; // * equals to all fields
    clientrequest( "order.info", [redstagOrderId,resultFields], function (err, res) {
        if (err) {
            //console.log("queryOrderInfo error: " + err);
            callback (true, []);
        }
        else {
            //console.log("queryOrderInfo: " + JSON.stringify(res));
            callback (false, res.result);
        }
    });
}


function orderUpdate (redstagOrderId, shippingAddress, orderAdditionalData, callback) {
    clientrequest( "order.edit", [redstagOrderId,shippingAddress, orderAdditionalData], function (err, res) {
        if (err) {
            console.log("orderUpdate error: " + err);
            callback (true, []);
        }
        else {
            console.log("orderUpdate JSON: " + JSON.stringify(res));

            if (res.error === undefined) {
                callback (false, res.result);
            } else {
                callback (true, res.error.message);
            }
        }
    });
}




// Shipments are not created in the system until an order goes into picking.
// There may be multiple shipments for one order depending on the overall weight and number of items on the order.
// Although there may be more than one package for a single shipment, most shipments will have only one package.

// A packing slip will be printed for each shipment and if multiple packages are required for one shipment they will
// be linked to the same master tracking number if supported by the carrier.

function queryAllShipments (callback) {
    var filter = null;
    var options = null;
    var resultFields = "*"; // * equals to all fields, but excluding "items" and "tracking_numbers".
    clientrequest( "shipment.search", [filter,options,resultFields], function (err, res) {
        if (err) {
           //console.log(err);
           callback (true, []);
        }
        else {
           //console.log(res);
           callback (false, res.result.results);
        }
    });
}

// shipment.info

// shipment.track



// There may be multiple packages for one shipment.
// Each package may have multiple tracking numbers, most packages will have only one tracking number.

// package.search

// deliveries (incoming ASN and RMA)


function queryDeliveries (callback) {
    var filter = null; // null: receive all deliveries
    var options = null;
    clientrequest( "delivery.search", [filter, options], function (err, res) {
        if (err) {
           console.log("deliveries query error");
           callback (err,[]);
        }
        else {
            //console.log(res);
            callback (err, res.result.results);
        }
    });
}





// inventory


function queryInventory (callback) {
    var skuArray = null; // if skuArray is null, then all sku will be returned
    clientrequest( "inventory.list", [skuArray], function (err, res) {
        if (err) { 
           console.log("inventory query error");
           callback (err,[]);
        }
        else { 
            //console.log(res);
            callback (err, res.result);
        }
    });
}


// rate.quote    (not yet available, according to documentation)


// fedexCost estimate

var fedex = require ("./fedexcost.js");

fedex.readCSV ( () => { console.log("fedex CSV data loaded."); } );
module.exports.readCSV = fedex.readCSV;
module.exports.fedexCost = fedex.fedexCost;

// shipping methods

var shippingMethodsFEDEX = [
    "fedex_FEDEX_2_DAY",    // FedEx 2Day®
    "fedex_FEDEX_2_DAY_AM", //	FedEx 2Day® A.M.
    "fedex_FEDEX_EXPRESS_SAVER", // 	FedEx Express Saver®
    "fedex_FEDEX_GROUND", //	FedEx Ground®
    "fedex_INTERNATIONAL_ECONOMY", //	FedEx International Economy®
    "fedex_INTERNATIONAL_PRIORITY", //	FedEx International Priority®
    "fedex_FIRST_OVERNIGHT" ,	// FedEx First Overnight®
    "fedex_GROUND_HOME_DELIVERY", //	FedEx Home Delivery®
    "fedex_PRIORITY_OVERNIGHT", //	FedEx Priority Overnight®
    "fedex_STANDARD_OVERNIGHT", // FedEx Standard Overnight®
    "fedex_SMART_POST", //
];

var shippingMethodsUPS = [
    "ups_01", //	UPS Next Day Air
    "ups_02", // 	UPS Second Day Air
    "ups_03", // 	UPS Ground
    "ups_12", // 	UPS Three-Day Select
    "ups_14", //	UPS Next Day Air Early A.M.
    "ups_59", //	UPS Second Day Air A.M.
];

var shippingMethodsUSPS = [ // available via stamps.com
    "usps_US-PM", // 	USPS Priority Mail
    "usps_US-PMI" //	USPS Priority Mail International
];

var shippingMethodsEXTERNAL = [
    "external_ltl" // LTL
];

var shippingMethodsAVAILABLE = shippingMethodsFEDEX.concat (shippingMethodsEXTERNAL);


// Export ***************************************************

module.exports.setDebug = setDebug;
module.exports.connect = connect;

// Order
module.exports.queryAllOrders = queryAllOrders;
module.exports.createOrder = createOrder;
module.exports.orderInfo = orderInfo;
module.exports.orderUpdate = orderUpdate;

// Shipments
module.exports.queryAllShipments = queryAllShipments;

// Deliveries
module.exports.queryDeliveries = queryDeliveries;

// Inventory
module.exports.queryInventory = queryInventory;

// Shipping Methods
module.exports.shippingMethodsFEDEX = shippingMethodsFEDEX;
module.exports.shippingMethodsUPS = shippingMethodsUPS;
module.exports.shippingMethodesUSPS = shippingMethodsUSPS;
module.exports.shippingMethodsEXTERNAL = shippingMethodsEXTERNAL;
module.exports.shippingMethodsAVAILABLE = shippingMethodsAVAILABLE;
