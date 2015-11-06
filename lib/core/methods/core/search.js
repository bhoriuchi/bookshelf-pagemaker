
// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: search function
//

module.exports = function(env) {

	// constants
	var _JTYP = env.statics.jsTypes;
	var _SCMA = env.statics.schema;
	var _SRCH = env.statics.search;
	
	// modules
	var _     = env.lodash;
	var utils = env.utils;
	var u     = utils.util;
	
	// takes in parameters for the pay-load array
	return function(search, searchable, model) {

		var sql    = '';

		
		// look for search
		search  = search || null;
		search  = (typeof(search) === _JTYP.string) ? [search] : search;
		search  = (search && typeof(search) === _JTYP.object &&
				search[_SRCH.search]) ? [search] : search;

				
		// get the schema for the current table
		var tableName    = model.tableName;

		var s = {};
	
		// determine if multiple fields will be searched
		if (Array.isArray(search)) {
			
			// loop through each field
			_.forEach(search, function(sobj) {
				
				// check for a simple string. this is an all search
				if (typeof(sobj) === _JTYP.string && sobj !== '') {
					
					// set for parent
					s._all        = {};
					s._all.type   = _SRCH.basic;
					s._all.search = sobj;
				}
				
				// otherwise check for an object that has a search parameter
				else if (typeof(sobj) === _JTYP.object &&
						_.has(sobj, _SRCH.search) &&
						typeof(sobj.search) === _JTYP.string && sobj.search !== '') {
					
					// if the object has no field parameter, it is the all fields
					// search. because a field can be named anything the field name
					// is omitted for all fields so that you can use column names like
					// all or any other variable that might be used to identify all fields					
					if (!_.has(sobj, _SRCH.field)) {

						// set parent
						s._all         = {};
						s._all.type    = utils.search.searchType(sobj.type);
						s._all.search  = sobj.search;
					}
					
					// otherwise check for an object that has a field parameter that
					// is a valid column name
					else if (_.has(sobj, _SRCH.field) && typeof(sobj.field) === _JTYP.string) {
						
						if (typeof(sobj.search) === _JTYP.string && sobj.search !== '') {
							s[sobj.field]        = {};
							s[sobj.field].type   = utils.search.searchType(sobj.type);
							s[sobj.field].search = sobj.search;
						}
					}
				}
			});
		}
		
		model._pagination_var.search = s || null;
	};
};