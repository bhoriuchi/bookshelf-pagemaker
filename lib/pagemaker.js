// Paginate Bookshelf Models with common formats
var Promise     = require('bluebird');
var fs          = require('fs');
var path        = require('path');
var qs          = require('qs');



module.exports = function(bookshelf) {

	
	
	
	
	// promisify fs
	Promise.promisifyAll(fs);
	
	
	
	
	
	// set up a config object that will hold the modules and variables
	// needed for each pagination module. this avoids redundant requires
	var util = require('./util')(bookshelf);
	var config = {
			util: util,
			bookshelf: bookshelf,
			Promise: Promise,
			qs: qs
	};
	
	
	

	// get page configurations. we will do this synchronously since it is only done
	// during start up. all runtime functions will use asyncronous methods
	var page_default_path   = path.resolve('../page_configs/default.json');
	var page_default_config = fs.readFileSync(page_default_path).toString();
	var byo                 = require('./byo')(config);
	
	

	
	
	// set up each pagination module
	var datatables = require('./datatables')(config);

	
	
	
	
	// define the supported pagination types and their associated functions
	var types = {
		"pagemaker": {
			"description": "Default Pagination type",
			"paginate": function(params, Model, baseURI) {
				return byo.makePage(params, Model, page_default_config, baseURI);
			}
		},
		"datatables": {
			"description": "jQuery Datatables format",
			"paginate": function(params, Model) {
				return datatables.makePage(params, Model);
			}
		}
	};

	
	
	
	
	// return public objects. this makes calling the pagination functions
	// a common convention in the form of 
	// <pagemaker variable>.<pagination type>.paginate(<request params>, <bookshelf model>);
	return types;
};
