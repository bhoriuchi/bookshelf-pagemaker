// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: core method code
//


module.exports = function(env) {

	// require each module and return it
	return {
		order: require('./order')(env),
		search: require('./search')(env)
	};
};