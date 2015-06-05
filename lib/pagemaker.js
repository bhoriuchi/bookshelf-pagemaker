// Paginate Bookshelf Models with common formats


module.exports = function(bookshelf) {
	
	// unique queries or settings that are database specific go here
	// only supported knex databases
	var dbTypes = {
			"mysql": {},
			"postgres": {},
			"maria": {},
			"sqlite3": {},
			"oracle": {}
	};
	
	
	
	
	
	// set up a config object that will hold the modules and variables
	// needed for each pagination module. this avoids redundant requires
	var util = require('./util')(bookshelf);
	var config = {
			util: util,
			bookshelf: bookshelf,
			dbTypes: dbTypes
	};
	
	
	
	
	
	// set up each pagination module
	var datatables = require('./datatables')(config);

	
	
	
	
	// pagemaker format
	function getPagemaker(params, Model) {
		console.log('pagemaker');
		return {};
	}

	
	
	
	
	// define the supported pagination types and their associated functions
	var types = {
		"pagemaker": {
			"description": "Default Pagination type",
			"paginate": function(params, Model) {
				return getPagemaker(params, Model);
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
