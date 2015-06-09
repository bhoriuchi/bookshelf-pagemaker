// Paginate Bookshelf Models with common formats
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
	var types = {
		"pagemaker": {
			"description": "Default Pagination type",
			"paginate": function(params, Model, baseURI) {
				return engine.makePage(params, Model, paginations.pagemaker, baseURI);
			}
		},
		"datatables": {
			"description": "jQuery Datatables format",
			"paginate": function(params, Model) {
				return engine.makePage(params, Model, paginations.datatables, '');
			}
		},
		"custom": {
			"description": "jQuery Datatables format",
			"paginate": function(params, Model, config) {
				
				// check the config for validity
				if (util.isValidConfig(config)) {
					return engine.makePage(params, Model, config, '');
				}
				
				// if the config was not valid return a promise with an error message
				return new Promise(function(resolve) {
					resolve({"error": "invalid pagination configuration"});
				});
			}
		}
	};

	
	
	
	
	// return public objects. this makes calling the pagination functions
	// a common convention in the form of 
	// <pagemaker variable>.<pagination type>.paginate(<request params>, <bookshelf model>);
	return types;
};
