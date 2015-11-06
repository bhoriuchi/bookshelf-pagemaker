// Author: Branden Horiuchi <bhoriuchi@gmail.com>
//


module.exports = function(env) {
	
	var _ = env.lodash;
	
	// return the function
	return function(opts) {
		
		var _self = this;
		var out;
		
		_self._pagination_var = _.has(_self, '_pagination_var') ? _self._pagination_var : {};
		var _results          = _self._pagination_var.results || null;

		// set default options
		opts = opts || {};
		opts.returnModel = (opts.returnModel === true) ? true : false;
		
		
		// check for a promise result
		if (_results && typeof(_results.then) === 'function') {

			// look for the return model option, resolve the promise and return the model
			if (opts.returnModel) {
				out = _results.then(function(results) {
					
					// wrap the results in a promise since the next method will
					// expect that the results are wrapped in a promise
					_self._pagination_var.results = env.utils.util.wrapPromise(results);

					// return the model
					return _self;
				});
			}
			else {
				
				// by default, resolve the promise and return the results
				out = _self._pagination_var.results.then(function(results) {

					// return the results
					return _self._pagination_var.results;
				});
			}
			
			
			// check for results and return them otherwise return no content
			if (_self._pagination_var.results) {
				return out;
			}
			else {
				return env.utils.util
				.wrapPromise(env.statics.httpStatus.NO_CONTENT);
			}
		}
		else {
			
			out = env.statics.httpStatus.NO_CONTENT;
			
			if (opts.returnModel) {
				out = _self;
			}
			
			return env.utils.util.wrapPromise(out);
		}
	};
};