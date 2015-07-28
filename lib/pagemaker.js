// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: Builds a pagination based on a bookshelf model
//              and a pagination definition/configuration which
//              can be supplied by the user in the custom pagination
//

var Promise     = require('bluebird');
var qs          = require('qs');
var paginations = require('./paginations');



module.exports = function(bookshelf) {


	// set up a config object that will hold the modules and variables
	// needed for each pagination module. this avoids redundant requires
	var util = require('./util')(bookshelf);
	var config = {
			util: util,
			bookshelf: bookshelf,
			Promise: Promise,
			qs: qs
	};
	
	
	
	
	
	// require the engine which will do all of the work and pass the 
	// already required modules so it can use them
	var engine = require('./engine')(config);

	
	
	
	
	// verify the formats
	var fKeys = Object.keys(paginations);
	for (var i = 0; i < fKeys.length; i++) {
		if (!util.isValidConfig(paginations[fKeys[i]])) {
			console.log('Invalid config for ' + fKeys[i] + ', exiting');
			process.exit(1);
		}
	}

	
	
	
	
	// define the supported pagination types and their associated functions
	// the args object has the following fields
	//
	// args = {
	//     params:    <HTTP Request parameters>,
	//     model:     <Bookshelf Model Definition>,
	//     config:    <Configuration object>,
	//     uri:       <Optional: Base URI for use with previous and next>,
	//     relations: <Optional: array of relations to load>
	// };
	//
	var types = {
		"pagemaker": {
			"description": "Default Pagination type",
			"paginate": function(args) {
				args.config = paginations.pagemaker;
				return engine.makePage(args);
			}
		},
		"datatables": {
			"description": "jQuery Datatables format",
			"paginate": function(args) {
				args.config = paginations.datatables;
				return engine.makePage(args);
			}
		},
		"custom": {
			"description": "jQuery Datatables format",
			"paginate": function(args) {
				
				// check the config for validity
				if (util.isValidConfig(args.config)) {
					return engine.makePage(args);
				}
				
				// if the config was not valid return a promise with an error message
				return new Promise(function(resolve) {
					resolve({"error": "invalid pagination configuration"});
				});
			}
		},
		paginations: paginations
	};

	
	
	
	
	// return public objects. this makes calling the pagination functions
	// a common convention in the form of 
	// <pagemaker variable>.<pagination type>.paginate(<request params>, <bookshelf model>);
	return types;
};
