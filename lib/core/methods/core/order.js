
// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: search function
//

module.exports = function(env) {

	// constants
	var _JTYP = env.statics.jsTypes;
	var _SCMA = env.statics.schema;
	var _ORD  = env.statics.order;

	
	// modules
	var _     = env.lodash;
	var utils = env.utils;
	var u     = utils.util;
	
	
	// takes in parameters for the pay-load array
	return function(order, model) {
		
		// create an orderList
		var orderList    = [];
		var sql          = '';
		var table        = model.tableName;

		// construct an order list
		if (typeof(order) === _JTYP.string) {
			
			// split the order string
			var list = order.split(',');
			
			// loop through each potential order object
			_.forEach(list, function(item) {
				
				// split each order object by a dot
				var o     = item.split('.');
				var field = o[0];
				var dir   = (o.length > 1) ? o[1] : _ORD.ascending;
				dir       = (dir === _ORD.ascending || dir === _ORD.descending) ? dir : _ORD.ascending;
				
				// push the order object
				orderList.push({
					field: field,
					direction: dir
				});
			});
		}
		else if (Array.isArray(order)) {
			orderList = order;
		}
		else if (order && typeof(order) === _JTYP.object) {
			orderList.push(order);
		}
		

		// set the order object
		model._pagination_var.order = orderList || null;
	};
};