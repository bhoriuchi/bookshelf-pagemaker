// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: set page
//


module.exports = function(env) {
	
	var _ = env.lodash;
	var u = env.utils.util;
	
	// return the function
	return function(page) {
		
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
			
			if (page || page === 0) {
				// set the offset
				_self._pagination_var.page = !isNaN(page) ? parseInt(page, 10) : 1;
				_self._pagination_var.page = _self._pagination_var.page > 0 ? _self._pagination_var.page : 1;
			}

			
			// return the results
			return results.results;
		})
		.caught(function(e) {

			// create a new error
			err = u.newErr(
				e.errno,
				'An error was thrown during the offset call',
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