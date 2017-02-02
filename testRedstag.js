var async = require ("async");
var R = require ("ramda");
var redstag = require ("redstag");


function myConnect (next) {
    // add your username and token here
    redstag.connect("demouser", "abslakdsf3jkdfjk", (err) => {
        if (err) console.log ("myConnect.login error");
        else console.log ("myConnect.login connected!");
        next (err);
    });
}

function queryOrders (next) {
    redstag.queryAllOrders( (err, orders) => {
        if (err) console.log ("queryOrders  error");
        else {
            console.log ("orders: " + orders.length);
            orders.map ( order => {
                console.log (order.created_at + " "+ order.order_ref + " " + order.state + " shiphawkId:" + order.order_id + " " + order.shipping_description + " weight:" + order.weight);
            });
        }
        next (err);
    });
}

function createDemoOrder (next) {

    var orderItems = [
        // { "sku": "PC50", "qty": 1 }
          { "sku": "product2", "qty": 3 }
    ];

    var shippingAddress = {
        "firstname" : "Bill",
        "lastname" : "Gates",
        "company" : "Microsoft",
        "street1" : "11 Times Square\nc/oSteve Ballmer", //  The street address. Multi-line street addresses will be separated by a newline ("\n") character.
        "city" : "New York",
        "region" : "NY",
        "postcode" : "10036", // The "Postal Code" property. Pass as a string to prevent leading 0s from being dropped.
        "country" : "US",
        "classification" : "com" ,  // The "Classification" property. Allowed: "res" - residential, "com" - commercial, "unk" - unknown.
        "is_valid" : 1,  // Flag whether address is valid.
        "telephone" : "212.245.2100" ,
        "email" :"bill@microsoft.com"
    };

    var orderAdditionalData = {
        order_ref: "clientOrderIdXXX",
        custom_greeting: "Thank you for your order",
        shipping_method: "fedex_FEDEX_GROUND"
    };


    redstag.createOrder (orderItems, shippingAddress, orderAdditionalData,  (err, data) => {
        if (err) console.log("error creating order: " + data);
        else console.log ("order created successfully: " + JSON.stringify( data) );
        next();
    });
}




async.series (
    [
        myConnect,
        queryOrders,
        createDemoOrder
    ]);


