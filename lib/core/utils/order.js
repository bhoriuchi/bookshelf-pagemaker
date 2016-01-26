// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Search function
//


module.exports = function(env) {
	
	// constants
	var _JTYP = env.statics.jsTypes;
	var _ORD  = env.statics.order;
	
	// modules
	var _     = env.lodash;
	
	
	// function to prepare the object 
	function prepareOrderObject(obj, table, info) {
		
		var orderObj = {};
		
		// check of the order object has a field and that
		// the field exists in the table
		if (!obj ||
			typeof(obj) !== _JTYP.object ||
			!_.has(obj, _ORD.field) ||
			!_.has(info, obj.field)) {
			
			return null;
		}
		
		// set the order object
		orderObj.field     = table + '.' + obj.field;
		orderObj.direction = (obj.direction === _ORD.ascending ||
				             obj.direction === _ORD.descending) ?
				             obj.direction : _ORD.ascending;
		
		// return the order object
		return orderObj;
	}
	
	
	
	// return the public functions
	return {
		prepareOrderObject: prepareOrderObject
	};
};