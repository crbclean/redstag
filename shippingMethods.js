
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
    "external_ltl", // LTL (arranged by Shiphawk)
    "external_ltl_thirdparty" // LTL - Third Party
];

	

var shippingMethodsAVAILABLE = shippingMethodsFEDEX.concat (shippingMethodsEXTERNAL);

module.exports = {
    shippingMethodsFEDEX,
    shippingMethodsUPS,
    shippingMethodsUSPS,
    shippingMethodsAVAILABLE
};