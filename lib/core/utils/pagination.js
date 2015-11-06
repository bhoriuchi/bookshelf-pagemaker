// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: pagination Helper function(s)
//



module.exports = function(env) {
	
	// constants
	var _JTYP = env.statics.jsTypes;
	var _STAT = env.statics.httpStatus;
	var _ERR  = env.statics.errorCodes;

	
	// modules
	var _     = env.lodash;
	var qs    = env.qs;
	var utils = env.utils;
	var u     = utils.util;
	var s     = utils.string;
	
	
	// function to push values into the output or unsorted array
	function addField(field, def, value, arr, un) {

		// add the total to the output array
		if (field && field.show !== false) {
			
			var fName = field.displayName || def;
			var dOrdr = !isNaN(field.displayOrder) ? parseInt(field.displayOrder, 10) : null;
			
			// check that the order index is not null and less than the length of the array
			// and that the array does not already have an item in the order spot
			if (dOrdr !== null && dOrdr < arr.length && !arr[dOrdr]) {
				arr[dOrdr] = u.newObj(fName, value);
			}
			else {
				un.push(u.newObj(fName, value));
			}
		}
		
		return {
			array: arr,
			unsorted: un
		};
	}
	
	// function to recreate a URI with the new page or offset
	function regenerateURI(baseURI, params, newParams, excludeParams) {
		
		// set defaults
		baseURI       = baseURI       || '';
		params        = params        || {};
		newParams     = newParams     || {};
		excludeParams = excludeParams || {};
		
		var newParamKeys = _.keys(newParams);
		var exParamKeys  = _.keys(excludeParams);
		
		// remove the keys that will be updated or excluded
		for (var i = 0; i < newParamKeys.length; i++) {
			if (_.has(params, newParamKeys[i])) {
				delete params[newParamKeys[i]];
			}
		}
		for (var j = 0; j < exParamKeys.length; j++) {
			if (_.has(params, exParamKeys[j])) {
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
	
	
	// function to return a pagination
	function paginate(m, results) {

		var forgedModel = m;
		var model       = m._model;
		var cfg         = m._pagination;
		var t           = m._pagination_var.transaction;
		var tableName   = m.tableName;
		var schema      = m._pagination_var._schema;
		var search      = m._pagination_var.searchSQL || '';

		// resolve the path
		var path        = _.has(schema, '_path.path') ? schema._path.path : tableName;
		path            = '/' + path.replace(/^\/|\/$/g, '');
		
		
		// get model variables
		var length      = forgedModel._pagination_var.limit;
		var start       = !isNaN(forgedModel._pagination_var.offset) ? parseInt(forgedModel._pagination_var.offset, 10) : 0;
		var href        = forgedModel._pagination_var.href || '';
		var baseURI     = href + path;
		var params      = _.has(forgedModel, '_pagination_var.req.params') ? forgedModel._pagination_var.req.params : null;
		
		
		// variables
		var page       = {};
		var f          = cfg.fields;
		var transforms = cfg.transforms;

		
		// initialize variables
		var _total, _filtered, r, result, fName, out;
		var recordsTotal, recordsFiltered;
		var pagesTotal, pagesFiltered, currentPage;
		var previous, next, uri;
		
		// get the field count
		var fieldCount = _.keys(cfg.fields).length;
		fieldCount     += Array.isArray(cfg.transforms) ? cfg.transforms.length : 0;
		
		
		// get param names
		var pageParam   = (f.currentPage && f.currentPage.param) ? f.currentPage.param : 'page';
		var startParam  = (f.start && f.start.param)             ? f.start.param       : 'start';
		var lengthParam = (f.length && f.length.param)           ? f.length.param      : 'length';
		
		// create an exclude param
		var newParams = function(startParam, start) {
			var out          = {};
			out[lengthParam] = length;
			out[startParam]  = start;
			return out;
		};
		
		
		// check for a rows config
		if (cfg.rows) {
			
			r = cfg.rows;
			
			// update the records with row functions
			for (var i = 0; i < results.length; i++) {
				
				// check for rowId
				if (r.rowId && typeof(r.rowId.get) === _JTYP.funct) {
					fName             = r.rowId.displayName || 'rowId';
					result            = r.rowId.get(forgedModel, results[i]);
					if (result) {
						results[i][fName] = result;
					}
				}
				// check for rowClass
				if (r.rowClass && typeof(r.rowClass.get) === _JTYP.funct) {
					fName             = r.rowClass.displayName || 'rowClass';
					result            = r.rowClass.get(forgedModel, results[i]);
					if (result) {
						results[i][fName] = result;
					}
				}
				// check for rowData
				if (r.rowData && typeof(r.rowData.get) === _JTYP.funct) {
					fName             = r.rowData.displayName || 'rowData';
					result            = r.rowData.get(forgedModel, results[i]);
					if (result) {
						results[i][fName] = result;
					}
				}
				// check for rowAttr
				if (r.rowAttr && typeof(r.rowAttr.get) === _JTYP.funct) {
					fName             = r.rowAttr.displayName || 'rowAttr';
					result            = r.rowAttr.get(forgedModel, results[i]);
					if (result) {
						results[i][fName] = result;
					}
				}
			}
		}
		
		// determine what values need to be queried
		var getTotalRecords    = (f.recordsTotal && f.recordsTotal.show !== false) ||
		                         (f.pagesTotal && f.pagesTotal.show !== false) ?
		                         true : false;
		
		
		// get recordsTotal if part of the pagination, otherwise null
		if (getTotalRecords) {
			_total = model.forge()
			.query(function(qb) {
				qb.count('* as count');
			})
			.fetch({transacting: t});
		}
		else {
			_total = u.wrapPromise(null);
		}
		
		// get the result
		return _total.then(function(rTotal) {

			rTotal = _.has(rTotal, 'attributes.count') ? rTotal.attributes.count : null;

			// convert the result of records total to a number
			recordsTotal = !isNaN(rTotal) ? parseInt(rTotal, 10) : 0;
			
			// add the field
			out = addField(f.recordsTotal, 'recordsTotal', recordsTotal, new Array(fieldCount), []);

			// always get the filtered results so that a 404 page can be displayed if
			// an invalid page or offset is attempted
			return model.forge()
			.query(function(qb) {
				
				// get the distinct rows
				qb.count('* as count').distinct(tableName + '.*');
				
				// set the optional SQL
				qb = search ? qb.andWhereRaw(search) : qb;
			})
			.fetch({transacting: t})
			.then(function(rFiltered) {
				
				// convert the result of records total to a number
				rFiltered       = _.has(rFiltered, 'attributes.count') ? rFiltered.attributes.count : null;
				recordsFiltered = !isNaN(rFiltered) ? parseInt(rFiltered, 10) : 0;
				
				
				// check that the start is less than the record count
				if (start >= recordsFiltered && recordsFiltered !== 0) {
					// throw an error
					throw u.newErr(
						_STAT.NOT_FOUND.code,
						_ERR.NOT_FOUND.detail,
						_ERR.NOT_FOUND.code,
						['The page does not exist', 'thrown from paginate']
					);
				}
				
				
				
				// add the fields
				out = addField(f.recordsFiltered, 'recordsFiltered', recordsFiltered, out.array, out.unsorted);
				out = addField(f.length, 'length', length, out.array, out.unsorted);

				
				// determine the format
				if (cfg.usePages === true) {
					
					// calculations
					pagesTotal    = Math.ceil(recordsTotal / length);
					pagesFiltered = Math.ceil(recordsFiltered / length);
					currentPage   = Math.ceil(start / length) + 1;
					previous      = ((currentPage - 1) > 0)              ? (currentPage - 1) : null;
					next          = ((currentPage + 1) <= pagesFiltered) ? (currentPage + 1) : null;

					
					// add the fields
					out = addField(f.pagesTotal, 'pagesTotal', pagesTotal, out.array, out.unsorted);
					out = addField(f.pagesFiltered, 'pagesFiltered', pagesFiltered, out.array, out.unsorted);
					
					
					// determine the current URI
					uri = (href !== '') ?
						regenerateURI(baseURI, params, newParams(pageParam, currentPage)) : currentPage;

					out = addField(f.currentPage, 'currentPage', uri, out.array, out.unsorted);
					
					
					// calculate the previous URI
					uri = (href !== '' && previous !== null) ?
						regenerateURI(baseURI, params, newParams(pageParam, previous)) : previous;

					out = addField(f.previous, 'previous', uri, out.array, out.unsorted);

					
					// calculate the next URI
					uri = (href !== '' && next !== null) ?
						regenerateURI(baseURI, params, newParams(pageParam, next)) : next;

					out = addField(f.next, 'next', uri, out.array, out.unsorted);
					
				}
				else {

					// calculations
					previous = ((start - length) > -1)              ? (start - length) : null;
					next     = ((start + length) < recordsFiltered) ? (start + length) : null;
					
					// output start
					out = addField(f.start, 'start', start, out.array, out.unsorted);
					

					// determine the current URI
					uri = (href !== '') ?
						regenerateURI(baseURI, params, newParams(startParam, start)) : start;
					out = addField(f.currentPage, 'current', uri, out.array, out.unsorted);
					
					
					// determine the previous URI
					uri = (href !== '' && previous !== null) ?
						regenerateURI(baseURI, params, newParams(startParam, previous)) : previous;
						  
					out = addField(f.previous, 'previous', uri, out.array, out.unsorted);
					

					// calculate the uri and add the field
					uri = (href !== '' && next !== null) ?
						regenerateURI(baseURI, params, newParams(startParam, next)) : next;

					out = addField(f.next, 'next', uri, out.array, out.unsorted);
				}

				
				// check for transforms
				if (params && Array.isArray(transforms)) {
					
					// loop through each transform
					_.forEach(transforms, function(tf) {
						
						// get the transform param
						var tfp = tf.param;
						
						// if there is a param and the request contains the param
						if (_.has(params, tfp)) {

							// set the value by running it through the transform function
							// or if there is no function pass the value through
							var tfval = (typeof(tf.transform) === _JTYP.funct) ? tf.transform(params[tfp]) : params[tfp];
							out = addField(tf, tfp, tfval, out.array, out.unsorted);
						}
					});
				}

				
				// add the data last
				out = addField(f.data, 'data', results, out.array, out.unsorted);

				
				// merge the data after removing any undefined			
				return _.merge.apply(
					this,
					_.union(
						_.remove(out.array, undefined),
						out.unsorted
					)
				);
			});
		});
	}
	
	
	// return public functions
	return {
		paginate: paginate,
		addField: addField,
		regenerateURI: regenerateURI
	};
};