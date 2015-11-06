// Author: Branden Horiuchi <bhoriuchi@gmail.com>
//


module.exports = function(env) {
	
	
	// constants
	var _SCMA  = env.statics.schema;
	
	// modules
	var utils  = env.utils;
	var u      = utils.util;
	var _      = env.lodash;
	
	
	// return the function
	return function(fields) {
		
		var _self     = this;
		
		
		_self._pagination_var = _.has(_self, '_pagination_var') ? _self._pagination_var : {};
		var _results          = _self._pagination_var.results || null;
		
		var err;
			
		// set the default view to nothing
		fields = fields || '';
		
		// check resolve input
		_self._pagination_var.results = u.resolveInput(null, _self).then(function(results) {
			
			// throw an error if the results are an error
			if (u.isErr(results.results)) {
				throw results.results;
			}
			
			if (Array.isArray(fields)) {
				_self._pagination_var.fields = fields;
			}
			else if (typeof(fields) === 'string') {
				_self._pagination_var.fields = fields.split(',');
			}
			else {
				_self._pagination_var.fields = null;
			}
			
			// return results
			return results.results;
		})
		.caught(function(e) {

			// create a new error
			err = u.newErr(
				e.errno,
				'An error was thrown during the view call',
				e.code,
				e.message,
				e.stack
			);
			
			// check if the error was thrown by factory or knex/bookshelf
			err = u.isErr(e) ? e : err;
			
			// check if errors should be thrown. usually used for
			// a chained transaction				
			if (_self._var.throwErrors) {
				throw err;
			}
			
			// return the error
			return u.wrapPromise(err);
		});
		
		return _self;
	};
};