# redstag api for node.js

http://redstagfulfillment.com/ is a very cool fullfillment company in Tennessee, USA.
They provide a JSON RPC api for Node.js ; for documentation see: http://docs.redstagfulfillment.com/

## Install

```
  npm install redstag
```

## Usage

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

## More complex demo

```

node node_modules/redstag/testRedstag.js

```

## Shipping Cost Estimation

Shipping Cost Estimation to ship from Nashville, TX is included in the file testZipCode.js; it uses distance estimation in miles
from "zipcodes" library; a fedex Zone lookup based on this distance, and then it reads the fedesGround.csv file to lookup the price
for a weight in lb for a given zone. Only supports zones 2 to 8.

```
 printInfo (78230, 2.0, "Texas-SanAntonio");
```
        
