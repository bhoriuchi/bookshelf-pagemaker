// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: utils
//


module.exports = function(env) {

	// since the utils are dependent on each other
	// they need to be added to the env in a
	// specific order
	env.utils = {};
	
	// no dependencies
	env.utils.util       = require('./util')(env);
	env.utils.string     = require('./string')(env);
	env.utils.sql        = require('./sql')(env);
	env.utils.order      = require('./order')(env);
	env.utils.search     = require('./search')(env);
	env.utils.pagination = require('./pagination')(env);
	
	// return the utils
	return env.utils;
};