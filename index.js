var rpc = require('jayson');
shortid = require('shortid');
var R = require ("ramda");
var async = require ("async");

var paginate = require("./paginate.js").paginate;

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


function createOrder (storeCode, orderItems, shippingAddress, orderAdditionalData, callback) {
    //var storeCode = null; // for defaultCode, enter null.
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
    queryOrders (filter, options, resultFields, callback);
   
}
function queryOrders (filter, options, resultFields, callback) {
    paginate ( queryOrdersPage, 100, filter, options, resultFields, callback); 
}
  
function queryOrdersPage (pageNumber, filter, options, resultFields, callback) {
    console.log("queryOrdersPage:" + pageNumber);
    if ( (options == null) || (options == undefined) ) options = {};
    options.limit = 100;
    options.page = pageNumber; 
    queryOrdersRaw (filter, options, resultFields, callback);
}


function queryOrdersRaw (filter, options, resultFields, callback) {
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

function queryDeliveries (filter, callback) {
    paginate ( queryDeliveriesPage, 100, filter, callback); 
}

function queryDeliveriesPage (pageNumber, filter, callback) {
    //var filter = null; // null: receive all deliveries
    var options = { limit: 100, page: pageNumber}; // Todo: Paging.  // was: null
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

function createDelivery  (deliveryType , deliveryData, deliveryItems, callback) {
    var storeCode = null;
    clientrequest( "delivery.create", [deliveryType, deliveryData, deliveryItems ], function (err, res) {
        if (err) {
            console.log(err);
            callback (err, "error - connectivity?");
        }
        else {
            if (res.error !== undefined) {
                console.log("createDelivery error: " + res.error.message);
                callback (true, res.error.message);
            } else {
                console.log(res);
                callback (false, res.result);
            }
        }
    });
}

// inventory


function queryInventory (skuArray, warehouseId, callback) {
    //var skuArray = null; // if skuArray is null, then all sku will be returned
    //var warehouseId = null; // if skuArray is null, then all warehouses will be returned
    console.log(`queryInventory skuArray: ${skuArray} warehouseId: ${warehouseId}`)
    clientrequest( "inventory.list", [skuArray, warehouseId], function (err, res) {
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

// store list

function queryStores (callback) {
    clientrequest( "store.list", [], function (err, res) {
        if (err) {
           console.log("stores query error");
           callback (err,[]);
        }
        else {
            //console.log(res);
            callback (err, res.result);
        }
    });
}


// warehouse list

function queryWarehouses (callback) {
    clientrequest( "warehouse.list", [], function (err, res) {
        if (err) {
           console.log("warehouses query error");
           callback (err,[]);
        }
        else {
            //console.log(res);
            callback (err, res.result);
        }
    });
}

function queryProducts (filter, options, storeId, callback) {

    if (filter==undefined) filter = null; 
                        // null - Retrieve list of all products.
                        // object - Retrieve list of products using specified filters.
                        // Allowed properties for filtering: "sku", "vendor_sku", "status", "availability", "visibility", "created_at", "updated_at".

    if (options == undefined) options = null; 
    // null - No options will be applied.
                        // object - Apply specified options.

    if (storeId == undefined) storeId = null; 
                      // null - Default store will be used.
                      // number - Specified store will be used.
                      // string - Specified store will be used.

    console.log(`queryProducts filter: ${filter} options: ${options} storeId: ${storeId}`)
    clientrequest( "product.search", [filter, options, storeId], function (err, res) {
        if (err) { 
           console.log("product query error");
           callback (err,[]);
        }
        else { 
            //console.log(res);
            callback (err, res.result);
        }
    });
}






// Export ***************************************************

var helper = require("./helper.js");
var fedex = require ("./fedexcost.js"); // fedexCost estimate

var shippingMethods = require("./shippingMethods.js");

fedex.readCSV ( () => { console.log("fedex CSV data loaded."); } );


module.exports= {
    setDebug,
    connect,

    // Order
    queryAllOrders,
    queryOrders,
    createOrder,
    orderInfo,
    orderUpdate,

    // Shipments
    queryAllShipments,

    // Deliveries
    queryDeliveries,
    createDelivery,

    // Inventory
    queryInventory,

    // Stores/Warhouses/Produts
    queryStores,
    queryWarehouses,
    queryProducts,

    // Shipping Methods
    shippingMethodsFEDEX: shippingMethods.shippingMethodsFEDEX,
    shippingMethodsUPS: shippingMethods.shippingMethodsUPS,
    shippingMethodsUSPS: shippingMethods.shippingMethodsUSPS,
    shippingMethodsEXTERNAL: shippingMethods.shippingMethodsEXTERNAL,
    shippingMethodsAVAILABLE : shippingMethods.shippingMethodsAVAILABLE, 

    DeliverySKUsummary : helper.DeliverySKUsummary,
    DeliveryWeight : helper.DeliveryWeight,

    // Fedex Cost Estimate
    readCSV : fedex.readCSV,
    fedexCost : fedex.fedexCost
};
