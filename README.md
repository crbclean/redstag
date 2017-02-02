# redstag api for node.js

http://redstagfulfillment.com/ is a very cool fullfillment company in Tennessee, USA.
Thjey provide a JSON RPC api for Node.js ; for documentation see: http://docs.redstagfulfillment.com/

usage:

```
require ("redstag");

redstag.connect ("username", "tokenPassword", (err) => {
    if (err) throw ("connection error");
    else {
        redstag.queryAllOrders ( (err, orders) => {
            if (err) console.log ("error querying orders!");
            else console.log (orders);
        });
    }
});

```


        
