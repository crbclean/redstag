var async = require("async");
var R = require("ramda");

var redstag = require ("../index.js");
// var redstag = require("redstag");


function myConnect(next) {
    // add your username and token here
    var user = "demo";
    var token = "alkdfjasdkfjasdkf";

    redstag.setDebug(false);
    redstag.connect(user, token, (err) => {
        if (err) console.log("myConnect.login error");
        else console.log("myConnect.login connected!");
        next(err);
    });
}

function queryStores(next) {
    redstag.queryStores((err, stores) => {
        console.log("storesJSON: " + JSON.stringify(stores));
        next();
    });
}

function queryWarehouses(next) {
    redstag.queryWarehouses((err, warehouses) => {
        console.log("warehousesJSON: " + JSON.stringify(warehouses));
        next();
    });
}



function queryOrder(orderId) {
    redstag.orderInfo(orderId, (err, order) => {
        console.log("orderInfoJSON: " + JSON.stringify(order));
    });
}

function queryOrders(next) {
    redstag.queryAllOrders((err, orders) => {
        var first = true;
        if (err) console.log("queryOrders  error");
        else {

            console.log("orders: " + orders.length);
            orders = orders.filter(s => s.status !== "canceled");
            console.log("orders filtered: " + orders.length);



            orders.map(order => {
                if (first) {
                    first = false;
                    queryOrder(order.unique_id);
                    console.log("OrderJSON: " + JSON.stringify(order));
                }
                console.log(order.created_at + " orderRef:" + order.order_ref + " " + order.state + " redstagOrderId:" + order.order_id + " " + order.shipping_description + " weight:" + order.weight);
                //console.log(JSON.stringify(order));
            });
        }
        next(err);
    });
}

function queryShipments(next) {
    redstag.queryAllShipments((err, shipments) => {
        if (err) console.log("queryShipments  error");
        else {
            var first = true;
            console.log("shipments: " + shipments.length);

            shipments = shipments.filter(s => s.status !== "canceled");
            console.log("shipments filtered: " + shipments.length);


            shipments.map(shipment => {
                if (first) {
                    first = false;
                    console.log("ShipmentJSON: " + JSON.stringify(shipment));
                }

                console.log(shipment.created_at + " " +
                    shipment.shipping_method + " " +
                    "orderUniqueId: " + shipment.order_unique_id + " " +
                    "shipmentId: " + shipment.shipment_id + " " +
                    shipment.status + " " +
                    shipment.total_weight + " " +
                    shipment.shipping_address.classification
                );
            });
        }
        next(err);
    });
}



function createDemoOrder(next) {

    var orderItems = [
        // { "sku": "PC50", "qty": 1 }
        { "sku": "product2", "qty": 3 }
    ];

    var shippingAddress = {
        "firstname": "Bill",
        "lastname": "Gates",
        "company": "Microsoft",
        "street1": "11 Times Square\nc/oSteve Ballmer", //  The street address. Multi-line street addresses will be separated by a newline ("\n") character.
        "city": "New York",
        "region": "NY",
        "postcode": "10036", // The "Postal Code" property. Pass as a string to prevent leading 0s from being dropped.
        "country": "US",
        "classification": "com", // The "Classification" property. Allowed: "res" - residential, "com" - commercial, "unk" - unknown.
        "is_valid": 1, // Flag whether address is valid.
        "telephone": "212.245.2100",
        "email": "bill@microsoft.com"
    };

    var orderAdditionalData = {
        order_ref: "clientOrderIdXXX",
        custom_greeting: "Thank you for your order",
        shipping_method: "fedex_FEDEX_GROUND"
    };


    redstag.createOrder(orderItems, shippingAddress, orderAdditionalData, (err, data) => {
        if (err) console.log("error creating order: " + data);
        else console.log("order created successfully: " + JSON.stringify(data));
        next();
    });
}


function queryInventory(next) {
    redstag.queryInventory((err, items) => {
        if (err) console.log("queryInventory  error");
        else {
            var first = true;
            console.log("inventory items: " + items.length);

            items = items.map(i => {
                i.qty = parseFloat(i.qty);
                return i;
            });

            items = items.filter(s => s.qty > 0);
            console.log("inventory filtered: " + items.length);

            items.map(item => {
                if (first) {
                    first = false;
                    console.log("InventoryJSON: " + JSON.stringify(item));
                }

                console.log(item.sku + " " + item.qty);
            });
        }
        next(err);
    });
}

function queryDeliveries(next) {
    var filter = null;
    redstag.queryDeliveries(filter, (err, deliveries) => {
        var first = true;
        if (err) console.log("queryDeliveries  error");
        else {

            console.log("deliveries: " + deliveries.length);
            //orders = orders.filter (s => s.status !== "canceled");
            //console.log ("orders filtered: " + orders.length);

            deliveries.map(d => {
                if (first) {
                    first = false;
                    console.log("DeliveryJSON: " + JSON.stringify(d));
                }
                console.log(d.created_at + " " +
                    " state: " + d.state + " " +
                    " senderRef:" + d.sender_ref + " " +
                    " merchantRef:" + d.merchant_ref + " " +
                    d.delivery_type + " " +
                    " #SKU:" + d.total_skus + " " +
                    d.sender_name + " " +
                    " carrier:" + d.carrier_name + " " +
                    " deliveredAt:" + d.delivered_at
                );

                //console.log(JSON.stringify(order));
            });
        }
        next(err);
    });
}





function modifyOrder(next) {

    var redstagOrderId = "476001";

    var shippingAddress = null;

    var orderAdditionalData = {
        order_ref: "clientOrderIdXYZ",
    };

    redstag.orderUpdate(redstagOrderId, shippingAddress, orderAdditionalData, (err, data) => {
        if (err) console.log("error updating order: " + data);
        else console.log("order updated successfully: " + JSON.stringify(data));
        next();
    });
}

function createDemoDelivery(next) {
    var deliveryType = "rma"; // Return from Customer
    var deliveryData = {
        "sender_name": "Bill Gates",
        "carrier_name": "FedEx",
        "expected_delivery": "2014-07-31",
        "merchant_ref": 12345,
        "store_id": 45 // this is the strong store
    };
    var deliveryItems = [
        // { "sku": "PC50", "qty_expected": 1 }
        { "sku": "product2", "qty_expected": 3 }
    ];

    redstag.createDelivery(deliveryType, deliveryData, deliveryItems, (err, data) => {
        if (err) console.log("error creating delivery: " + data);
        else console.log("delivery created successfully: " + JSON.stringify(data));
        next();
    });
}


async.series(
    [
        myConnect,

        // query
        queryStores,
        queryWarehouses,
        //queryOrders,
        //queryShipments,
        //queryInventory,
        queryDeliveries,

        // modify
        //createDemoOrder,
        //modifyOrder,
        //createDemoDelivery
    ]);