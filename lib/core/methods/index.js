// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: methods
//


module.exports = function(env) {

	// require the core method code
	env.methodcore = require('./core')(env);
	
	// main methods
	return {
		end      : require('./end')(env),
		fields   : require('./fields')(env),
		href     : require('./href')(env),
		limit    : require('./limit')(env),
		offset   : require('./offset')(env),
		order    : require('./order')(env),
		paginate : require('./paginate')(env),
		search   : require('./search')(env)
	};
};