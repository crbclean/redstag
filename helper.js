var R = require("ramda");


// "items":[
//        {"delivery_item_id":"72396","delivery_id":"13586","product_id":"14256","qty_expected":"192.0000","qty_received":"96.0000","qty_shortage":"96.0000","qty_overage":"0.0000","qty_processed":"96.0000","qty_putaway":"96.0000","qty_committed":"96.0000","sku_merge_email_sent":"0","sku":"B853-DS/2"},
//        {"delivery_item_id":"72397","delivery_id":"13586","product_id":"14255","qty_expected":"192.0000","qty_received":"96.0000","qty_shortage":"96.0000","qty_overage":"0.0000","qty_processed":"96.0000","qty_putaway":"96.0000","qty_committed":"96.0000","sku_merge_email_sent":"0","sku":"B852-DS/2"},
//        {"delivery_item_id":"72398","delivery_id":"13586","product_id":"14254","qty_expected":"96.0000","qty_received":"48.0000","qty_shortage":"48.0000","qty_overage":"0.0000","qty_processed":"48.0000","qty_putaway":"48.0000","qty_committed":"48.0000","sku_merge_email_sent":"0","sku":"B851-DS/2"},
//        {"delivery_item_id":"72399","delivery_id":"13586","product_id":"14234","qty_expected":"96.0000","qty_received":"48.0000","qty_shortage":"48.0000","qty_overage":"0.0000","qty_processed":"48.0000","qty_putaway":"48.0000","qty_committed":"48.0000","sku_merge_email_sent":"0","sku":"B751-DS/2"},
//        {"delivery_item_id":"72400","delivery_id":"13586","product_id":"14231","qty_expected":"480.0000","qty_received":"240.0000","qty_shortage":"240.0000","qty_overage":"0.0000","qty_processed": "240.0000","qty_putaway": "240.0000","qty_committed": "240.0000","sku_merge_email_sent": "0","sku": "B750-DS/2"}
//  ],

function DeliverySKUsummary (delivery) {
    var items = R.map (item => {
        return {
            sku: item.sku,
            qty: parseFloat(item.qty_received)
        }
    }, delivery.items);

    //console.log(items);
    var toText = (s, item) => { return s + `${item.sku}:${item.qty} ` };
    return R.reduce( toText , "", items);
}


// "containers": [
//        {   "container_id": "35688",
//            "delivery_id": "13586",
//            "container_type_id":"1",
//            "damage_type":"none",
//            "weight_discrepancy":"none",
//            "tare_weight":"40.0000",
//            "weight":"614.0000",
//            "weighed_at":"2016-12-22 01:31:36",
//            "weighed_by":"320",
//            "contents":"a: 1: {i: 0;a: 3: {s: 16:\"delivery_item_id\";s:5:\"72400\";s:11:\"qty_counted\";i:120;s:12:\"qty_shortage\";i:0;}}",
//            "notes": null,
//            "total_skus": "1.0000"
//        },

function DeliveryWeight (delivery) {
    var items = R.map (item => {
        return {
            id: item.container_id,
            weight: parseFloat(item.weight)
        }
    }, delivery.containers);

    //console.log(items);
    var add = (s, item) => { return s + item.weight };
    return R.reduce( add , 0.0, items);
}



module.exports.DeliverySKUsummary = DeliverySKUsummary;
module.exports.DeliveryWeight=DeliveryWeight;