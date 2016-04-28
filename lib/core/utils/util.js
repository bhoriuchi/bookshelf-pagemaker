// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: misc utils
//


module.exports = function(env) {
	
	// constants
	var _JTYP   = env.statics.jsTypes;
	var _INFO   = env.statics.info;
	var _STAT   = env.statics.httpStatus;
	
	// modules
	var Promise = env.promise;
	var _       = env.lodash;
	

	// function to create a new error
	function newErr(code, message, error, details, stack) {
		
		code    = code || -1;
		message = message || '';
		error   = error || '';
		
		// put the details into an array if they are not one
		details = details || [];
		details = Array.isArray(details) ? details : [details];
		
		stack   = stack || '';
		
		return {
			code: code,
			message: message,
			error: error,
			details: details,
			stack: stack
		};
	}
	
	
	// create a new object with optional values set
	function newObj(field, value) {
		
		var obj = {};
		
		if (field) {
			obj[field] = (value === undefined) ? null : value;
		}
		
		return obj;
	}
	
	
	// for returning a status instead of an object. can be used to speed up save operations
	function wrapPromise(result) {

		return new Promise(function(resolve) {
			resolve(result);
		});
	}

	// function to conver value to boolean
	function toBoolean(value) {
		var strValue = String(value).toLowerCase();
		strValue = ((!isNaN(strValue) && strValue !== '0') &&
				strValue !== '' &&
				strValue !== 'null' &&
				strValue !== 'undefined') ? '1' : strValue;
		return strValue === 'true' || strValue === '1' ? true : false;
	}

	// function to build an id list
	function resolveInput(idList, model) {

		var _ids;
		
		// check that there is an id to remove
		if (!idList && !model.results) {
			model._pagination_var.results = wrapPromise(null);
			_ids = wrapPromise([]);
		}
		else if (!idList && model.results) {
			_ids = model.results;
		}
		else {
			_ids = wrapPromise(idList);
		}
		
		
		
		// return the IDs
		return _ids.then(function(results) {

			var out = {
				valid: true
			};
			
			if (Array.isArray(results) && (results.length === 0 || results[0] === -1 || isErr(results[0]))) {
				out.valid = false;
			}
			else if (!results || results === -1 || isErr(results)) {
				out.valid = false;
			}

			
			// put the id into an array if it is not already
			var ids = _.clone(results, true);
			ids     = Array.isArray(ids) ? ids : [ids];
			
			// convert the array to an array of unique IDs
			ids = _.uniq(
				_.map(ids, function(value) {
					if (_.has(value, model.idAttribute)) {
						return value[model.idAttribute];
					}
					else if (value) {
						return value;
					}
				})
			);

			
			// set values
			out.ids     = ids;
			out.results = results;
			
			// return the IDs and results
			return out;
		});
	}
	
	
	// function to check if the object is a status code
	function isStatus(obj) {
		
		if (obj && typeof(obj) === _JTYP.object &&
				_.keys(obj).length === 2 &&
				_.has(obj, _INFO.code) &&
				_.has(obj, _INFO.message) &&
				typeof(obj.code) === _JTYP.number &&
				typeof(obj.message) === _JTYP.string) {
			return true;
		}
		return false;
	}
	
	
	
	// function to check the object signature and verify that is is an error
	function isErr(obj) {
		
		if (obj && typeof(obj) === _JTYP.object &&
				!Array.isArray(obj) &&
				_.keys(obj).length === 5 &&
				_.has(obj, _INFO.code) &&
				_.has(obj, _INFO.message) &&
				_.has(obj, _INFO.error) &&
				_.has(obj, _INFO.details) &&
				_.has(obj, _INFO.stack)) {
			return true;
		}
		return false;
	}
	
	// function to check if an item is a hash
	function isHash(obj) {
		return !_.isArray(obj) && !_.isFunction(obj) && _.isObject(obj);
	}
	
	// return public functions
	return {
		isErr: isErr,
		isStatus: isStatus,
		isHash: isHash,
		resolveInput: resolveInput,
		wrapPromise: wrapPromise,
		toBoolean: toBoolean,
		newObj: newObj,
		newErr: newErr,
	};
};