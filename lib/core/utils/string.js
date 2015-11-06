// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: string utils
//


module.exports = function(env) {
	
	
	// function to replace %s in another string
	function parse(str) {
	    var args = [].slice.call(arguments, 1),
	        i = 0;

	    return str.replace(/%s/g, function() {
	        return args[i++];
	    });
	}
	

	// return public functions
	return {
		parse: parse
	};
};