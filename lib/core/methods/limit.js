// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: set limit
//


module.exports = function(env) {
	
	var _ = env.lodash;
	var u = env.utils.util;
	
	// return the function
	return function(limit) {
		
		var _self = this;
		
		_self._pagination_var = _.has(_self, '_pagination_var') ? _self._pagination_var : {};
		var _results          = _self._pagination_var.results || null;
		
		var err;
		
		// check resolve input
		_self._pagination_var.results = u.resolveInput(null, _self).then(function(results) {
			
			// throw an error if the results are an error
			if (u.isErr(results.results)) {
				throw results.results;
			}
			
			// set the limit
			if (limit) {
				_self._pagination_var.limit = !isNaN(limit) ? parseInt(limit, 10) : null;
				_self._pagination_var.limit = _self._pagination_var.limit > 0 ? _self._pagination_var.limit : 1;
			}

			// return the results
			return results.results;
		})
		.caught(function(e) {

			// create a new error
			err = u.newErr(
				e.errno,
				'An error was thrown during the limit call',
				e.code,
				e.message,
				e.stack
			);
			
			// check if the error was thrown by factory or knex/bookshelf
			err = u.isErr(e) ? e : err;
			
			// check if errors should be thrown. usually used for
			// a chained transaction				
			if (_self._pagination_var.throwErrors) {
				throw err;
			}
			
			// return the error
			return u.wrapPromise(err);
		});

		return _self;
	};
};