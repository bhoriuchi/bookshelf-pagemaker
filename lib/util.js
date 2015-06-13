// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: Reusable functions and objects
//
module.exports = function(bookshelf) {
	
	
	var search_directions = [ 'asc', 'desc' ];
	
	
	// unique queries or settings that are database specific go here
	// only supported knex databases
	var dbTypes = {
			"mysql": {
				"regex": function(compareTo, regex) {
					return compareTo + " REGEXP '" + regex + "' AND ";
				}
			},
			"postgres": {
				"regex": function(compareTo, regex) {
					return compareTo + " ~ '" + regex + "' AND ";
				}
			},
			"maria": {
				"regex": function(compareTo, regex) {
					return compareTo + " REGEXP '" + regex + "' AND ";
				}
			},
			"sqlite3": {
				"regex": function(compareTo, regex) {
					return compareTo + " REGEXP '" + regex + "' AND ";
				}
			},
			"oracle": {
				"regex": function(compareTo, regex) {
					return "REGEXP_LIKE(" + compareTo + ",'" + regex + "') AND ";
				}
			}
	};
	
	
	
	
	
	// function to get the total records for a specific table
	// returns the count as a promise
	function getTotalRecords(model) {
		model.resetQuery();
		return model.query()
		.count('* as CNT')
		.then(function(count) {
			return count[0].CNT;
		});
	}
	
	
	
	
	
	// function to get the total filtered results
	function getTotalFilteredRecords(model, filterSQL) {
		model.resetQuery();
		return model.query()
		.count('* as CNT')
		.whereRaw(filterSQL)
		.then(function(count) {
			return count[0].CNT;
		});
	}
	
	
	
	
	// searches an array of objects for a specific key value and returns
	// a specified key value that may be the same or different
	function getObjectValue(objArray, findKey, findValue, returnKey) {
		
		if (Array.isArray(objArray)) {
			for (var i = 0; i < objArray.length; i++) {
				var o = objArray[i];
				if (o.hasOwnProperty(findKey) &&
						o.hasOwnProperty(returnKey) &&
						o[findKey] === findValue) {
					return o[returnKey];
				}
			}
		}
		
		return '';
	}
	
	
	
	
	
	// generate a concat string of searchable columns
	function getColumnConcatSQL(keys, params, cfg) {
		
		var sql = '';
		//var keys = Object.keys(info);
		
		for(var i = 0; i < keys.length; i++) {
			
			var colName = keys[i];
			
			// check for datatables format input
			if (typeof (params[cfg.search.complex.fieldsKey]) === 'object') {
				var searchable = getObjectValue(params[cfg.search.complex.fieldsKey], 'data', colName, 'searchable');
				sql += (searchable === 'true') ? ',`' + colName + '`' : '';
			}
			else {
				sql += ',`' + colName + '`';
			}
		}

		return "concat_ws('|'" + sql + ")";
	}
	
	
	
	
	
	// function to get sql for each keyword
	function getKeywordSQL(keyString, compareTo) {

		var sql = '';
		var keywords = keyString.match(/("[^"]+"|[^\s]+)/g);
		
		if (Array.isArray(keywords)) {
			for (var i = 0; i < keywords.length; i++) {
				var kw = keywords[i].replace(/"/g, '');
				sql += (kw !== '') ? compareTo + " like '%" + kw + "%' and " : '';
			}
		}
		
		return sql;
	}
	
	
	
	
	
	// function to get regex sql
	function getRegexSQL(regex, compareTo) {

		var sql = '';
		var dbType = bookshelf.knex.client.config.client;
		
		// make regex usable in sql
		regex = regex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		
		// make sure the type has a supported regex function
		if (typeof (dbTypes[dbType]) === 'object' &&
				dbTypes[dbType].hasOwnProperty('regex')) {
			sql += dbTypes[dbType].regex(compareTo, regex);
		}
		
		return sql;
	}
	
	
	
	
	
	// get either keyword or regex sql
	function getFilterTypeSQL(obj, compareTo, cfg) {
		
		var sql = '';
		var s   = cfg.search;
		var cs  = cfg.complex.search;
		
		// check if the search is a complex one
		if (s.complex && cfg.complex.enabled) {

			// make sure all the required objects are there
			if (typeof (obj[cs.key]) === 'object' &&
					obj[cs.key].hasOwnProperty(cs.value) &&
					obj[cs.key][cs.value] !== '') {
				
				// check if the search is a regex otherwise its a simple string search
				if (obj[cs.key].hasOwnProperty(cs.regex) && obj[cs.key][cs.regex] === 'true') {
					sql += getRegexSQL(obj[cs.key][cs.value], compareTo);
				}
				else {
					sql += getKeywordSQL(obj[cs.key][cs.value], compareTo);
				}
			}
		}
		
		// all other searches are simple searches
		else {

			if (obj.hasOwnProperty(cfg.search.param)) {
				sql += getKeywordSQL(obj[s.param], compareTo);
			}
			if (obj.hasOwnProperty(cfg.search.regexParam)) {
				sql += getRegexSQL(obj[s.regexParam], compareTo);
			}
		}
		
		return sql;
	}
	
	
	
	
	
	// function to get the filter sql
	function getFilterSQL(columns, params, cfg, concatSQL) {
		
		// get the main search sql
		var sql = '';
		var cs  = cfg.complex.search;
		
		// only create search sql if search is enabled
		if (cfg.search.enabled) {

			sql = getFilterTypeSQL(params, concatSQL, cfg);
			
			
			if (cfg.search.complex && cfg.complex.enabled) {
				
				// check each column for a search if columns exist
				if (typeof (params[cfg.complex.param]) === 'object' && Array.isArray(params[cfg.complex.param])) {
					var cx = params[cfg.complex.param];
					
					// loop through the complex fields
					for (var j = 0; j < cx.length; j++) {
						
						var col     = cx[j];
						var colName = col[cfg.complex.fieldName] || '';


						// make sure the field exists before adding the sql 
						if (columns.indexOf(colName) !== -1 &&
								typeof (col[cfg.complex.search.key]) === 'object' &&
								col[cs.key].hasOwnProperty(cs.value) &&
								col[cs.value] !== '') {
							
							sql += getFilterTypeSQL(col, col.data, cfg);
						}
					}
				}
			}
		}
		
		// add an always true statement to either follow any ANDs
		// or to return something for the whereRaw function
		sql += ' 1 = 1';
		
		return sql;
	}
	
	
	
	
	
	// function to determine if an object has all the properties
	function hasProperties(obj, props) {
		for (var i = 0; i < props.length; i++) {
			if (!obj.hasOwnProperty(props[i])) {
				console.log('missing property ' + props[i]);
				return false;
			}
		}
		return true;
	}
	
	
	
	
	
	// order function to generate ordering sql
	function getOrderSQL(cols, params, cfg) {

		var sql = '';
		
		if (cfg.order.enabled) {

			// check for complex sort
			if (typeof (params[cfg.order.param]) === 'object' && cfg.complex.enabled && cfg.order.complex) {

				for (var i = 0; i < params[cfg.order.param].length; i++) {
					
					var cx           = cfg.complex;
					var order        = params[cfg.order.param][i];
					var sortColId    = parseInt(order[cx.order.field], 10);
					var sortCol      = params[cx.param][sortColId][cx.fieldName];
					
					// check if the field is sortable
					if (params[cx.param][sortColId][cx.orderable] === 'true' && cols.indexOf(sortCol) !== -1) {
						//query = query.orderBy(sortCol, order[cx.order.direction]);
						sql = (sql !== '') ? sql + ',' : sql;
						sql += sortCol + ' ' + order[cx.order.direction];
					}
				}
			}
			else if (params.hasOwnProperty(cfg.order.param) && params[cfg.order.param] !== '') {
				
				var orderList = params[cfg.order.param].split(',');

				for (var j = 0; j < orderList.length; j++) {
					
					var orderItem    = orderList[j].split('.');
					var col          = orderItem[0];
					var dir          = (orderItem.length > 1 &&
							search_directions.indexOf(orderItem[1]) !== -1) ? orderItem[1] : cfg.order.defaultDirection;

					if (cols.indexOf(col) !== -1) {
						//query = query.orderBy(col, dir);
						sql = (sql !== '') ? sql + ',' : sql;
						sql += col + ' ' + dir;
					}
				}
			}
		}
		
		return sql;
	}
	
	
	
	
	
	// function to validate if config is valid
	function isValidConfig(config) {
		return (typeof (config) === 'object' &&
				typeof (config.style) === 'object' &&
				typeof (config.data) === 'object' &&
				typeof (config.pageSize) === 'object' &&
				typeof (config.offset) === 'object' &&
				typeof (config.page) === 'object' &&
				typeof (config.pageCount) === 'object' &&
				typeof (config.count) === 'object' &&
				typeof (config.filteredCount) === 'object' &&
				typeof (config.previous) === 'object' &&
				typeof (config.next) === 'object' &&
				typeof (config.search) === 'object' &&
				typeof (config.order) === 'object' &&
				typeof (config.complex) === 'object' &&
				typeof (config.complex.search) === 'object' &&
				typeof (config.complex.order) === 'object' &&
				hasProperties(config.style, ['type']) &&
				hasProperties(config.data, ['show', 'field']) &&
				hasProperties(config.pageSize, ['show', 'field', 'defaultValue', 'maximum', 'param']) &&
				hasProperties(config.offset, ['show', 'field', 'defaultValue', 'param']) &&
				hasProperties(config.page, ['show', 'field', 'defaultValue', 'param']) &&
				hasProperties(config.pageCount, ['show', 'field']) &&
				hasProperties(config.count, ['show', 'field']) &&
				hasProperties(config.filteredCount, ['show', 'field']) &&
				hasProperties(config.previous, ['show', 'field']) &&
				hasProperties(config.next, ['show', 'field']) &&
				hasProperties(config.search, ['enabled', 'param', 'regexParam', 'complex']) &&
				hasProperties(config.order, ['enabled', 'param', 'defaultDirection', 'complex']) &&
				hasProperties(config.complex, ['enabled', 'param', 'fieldName', 'searchable', 'orderable']) &&
				hasProperties(config.complex.search, ['key', 'value', 'regex']) &&
				hasProperties(config.complex.order, ['key', 'field', 'direction']));
	}
	

	
	
	
	// function to recreate a uri with the new page or off
	function regenerateURI(baseURI, params, newParams, excludeParams, qs) {
		
		var newParamKeys = Object.keys(newParams);
		var exParamKeys = Object.keys(excludeParams);
		
		// remove the keys that will be updated or excluded
		for (var i = 0; i < newParamKeys.length; i++) {
			if (params.hasOwnProperty(newParamKeys[i])) {
				delete params[newParamKeys[i]];
			}
		}
		for (var j = 0; j < exParamKeys.length; j++) {
			if (params.hasOwnProperty(exParamKeys[j])) {
				delete params[exParamKeys[j]];
			}
		}
		
		// add the new params
		for (var k = 0; k < newParamKeys.length; k++) {
			params[newParamKeys[k]] = newParams[newParamKeys[k]];
		}
		
		// combine everything
		var queryParams = qs.stringify(params);
		return baseURI + '?' + queryParams;
	}
	
	
	
	
	
	// return all the public functions
	return {
		getTotalRecords: getTotalRecords,
		getTotalFilteredRecords: getTotalFilteredRecords,
		getObjectValue: getObjectValue,
		getColumnConcatSQL: getColumnConcatSQL,
		getFilterSQL: getFilterSQL,
		dbTypes: dbTypes,
		isValidConfig: isValidConfig,
		regenerateURI: regenerateURI,
		hasProperties: hasProperties,
		getOrderSQL: getOrderSQL
	};
};
