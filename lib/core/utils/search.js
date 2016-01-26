// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: search util functions
//


module.exports = function(config) {

	// constants
	var _SCMR     = config.statics.schemer;
	var _SRCH     = config.statics.search;
	var _JTYP     = config.statics.jsTypes;

	// modules
	var _         = config.lodash;
	var utils     = config.utils;
	
	
	// function to get search-able fields defined by the schema
	function getSearchable(parentSchema, childSchema) {
		
		var parentSearchable = [];
		var childSearchable  = [];
		
		// check for temporal
		if (childSchema) {
			var childFields = utils.schema.getColumns(childSchema);
			childSearchable = _.keys(
				_.pick(childFields, function(c) {
					return !_.has(c, _SRCH.searchable) || c.searchable;
				})
			);
		}
		
		var parentFields = utils.schema.getColumns(parentSchema);
		parentSearchable = _.keys(
			_.pick(parentFields, function(p) {
				return !_.has(p, _SRCH.searchable) || p.searchable;
			})
		);
		
		return {
			parent: parentSearchable,
			child: childSearchable
		};
	}

	// resolve the search-able values from an array of search-able values
	function resolveSearchable(searchable, parentSchema, childSchema) {
		
		var parentSearchable = [];
		var childSearchable  = [];
		
		// loop through each value and determine which schema it belongs to
		_.forEach(searchable, function(column) {
			
			if (_.has(parentSchema, column)) {
				parentSearchable.push(column);
			}
			if (childSchema && _.has(childSchema, column)) {
				childSearchable.push(column);
			}
		});
		
		return {
			parent: parentSearchable,
			child: childSearchable
		};
	}
	
	
	// generate a concatenated string of search-able columns
	function getColumnConcat(table, info) {
		
		var sql = '';
		
		// check that the schema is an object
		if (info && typeof(info) === _JTYP.object) {
			
			// get the SQL
			_.forEach(info, function(colSchema, colName) {
				sql += ',' + table + '.' + colName;
			});
		}
		
		return sql;
	}
	
	
	// get search type
	function searchType(type) {
		
		// define search types
		var types = [_SRCH.basic, _SRCH.regex];
		
		// check that the type is a string
		if (type && typeof(type) === _JTYP.string) {
			
			// check that the type is in the valid types array, default to basic
			return (_.intersection(types, [type.toLowerCase()]).length > 0) ? type : _SRCH.basic;
		}
		
		// by default return basic type
		return _SRCH.basic;
	}
	
	
	// function to get SQL for each keyword
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

	
	// function to get REGEX SQL
	function getRegexSQL(regex, compareTo) {

		var sql = '';
		var s   = utils.sql.getSpecific();

		// make REGEX usable in SQL
		regex = regex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		
		// make sure the type has a supported regex function
		if (typeof (s) === _JTYP.object &&
				_.has(s, _SRCH.regex)) {
			sql += s.regex(compareTo, regex);
		}
		
		return sql;
	}
	
	
	
	// return public functions
	return {
		resolveSearchable: resolveSearchable,
		searchType: searchType,
		getSearchable: getSearchable,
		getColumnConcat: getColumnConcat,
		getKeywordSQL: getKeywordSQL,
		getRegexSQL: getRegexSQL
	};
};