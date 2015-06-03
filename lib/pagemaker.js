// Paginate Bookshelf Models with common formats

module.exports = function(bookshelf) {
	
	
	
	
	
	// pagemaker format
	function getPagemaker(params, Model) {
		console.log('pagemaker');
		return {};
	}
	

	
	
	// Datatables format
	function getDatatables(params, Model) {
		
		// set defaults if none provided
		var draw             = parseInt(params.draw, 10) || 0;
		var start            = parseInt(params.start, 10) || 0;
		var length           = parseInt(params.length, 10) || 25;
		var page             = { draw: draw };
		
		// create a model instance and get the tableName
		// for use in the knex query
		var m                = new Model();
		var tableName        = m.tableName;
		
		
		// construct a base knex object for the query
		var query            = bookshelf.knex.select()
                               .table(tableName);

		// generate SQL for single or multi-column order		
		for (var i = 0; i < params.order.length; i++) {
			var order        = params.order[i];
			var sortCol      = params.columns[parseInt(order.column, 10)].data;
			query            = query.orderBy(sortCol, order.dir);
		}

		// return the filtered query results
		return query.offset(start).limit(length).then(function(data) {
			
			page.data = data;
		})
		.then(function() {
			
			return query.count('id as CNT').then(function(count) {
				
				page.recordsTotal = count[0].CNT;
				page.recordsFiltered = page.recordsTotal;
				
				return count;
			});
		})
		.then(function() {
			
			return page;
		});
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
				return getDatatables(params, Model);
			}
		}
	};
	
	
	
	
	
	
	
	
	
	
	// return public objects
	return {
		types: types
	};
};
