// datatables function
// creates datatable pagination with support for
// searching and ordering


module.exports = function(config) {
	
	
	
	
	
	var util                 = config.util;
	var bookshelf            = config.bookshelf;
	var dbTypes              = config.dbTypes;

	
	
	
	
	// Datatables format
	function makePage(params, Model) {
 
		
		// set defaults if none provided
		var draw             = parseInt(params.draw, 10) || 0;
		var start            = parseInt(params.start, 10) || 0;
		var length           = parseInt(params.length, 10) || 10;
		var page             = { draw: draw };
		var filterSQL        = '';
		
		
		// create a model instance and get the tableName
		// for use in the knex query
		var m                = new Model();
		var tableName        = m.tableName;
		
		
		// construct a base knex object for the query
		var query            = bookshelf.knex.select()
                             .table(tableName);

		
		// generate SQL for single or multi-column order
		// if the order object is missing for some reason 
		// skip ordering
		if (typeof (params.order) === 'object') {
			for (var i = 0; i < params.order.length; i++) {
				var order        = params.order[i];
				var sortCol      = params.columns[parseInt(order.column, 10)].data;
				query            = query.orderBy(sortCol, order.dir);
			}
		}

		
		// return the filtered query results
		return bookshelf.knex(tableName).columnInfo().then(function(info) {
			
			// use util functions to get the filter sql
			// by default if there is no filter specified a 1 = 1
			// statement will be returned so that whereRaw can return
			// all results
			var concatSQL = util.getColumnConcatSQL(info, params);
			filterSQL = util.getFilterSQL(concatSQL, params);
			query = query.whereRaw(filterSQL);
			
			//console.log(filterSQL);
			return info;
			
		})
		.then(function() {
			
			// get only the required results as data
			return query.offset(start).limit(length).then(function(data) {
				page.data = data;
			});
		})
		
		.then(function() {
			
			// get the total records
			return util.getTotalRecords(tableName).then(function(count) {
				page.recordsTotal = count;
				return;
			});
		})
		.then(function() {
			
			// set filtered to the total records
			page.recordsFiltered = page.recordsTotal;
			filterSQL = (filterSQL !== '') ? filterSQL : '1 = 1';

			// get the filtered results count
			return util.getTotalFilteredRecords(tableName, filterSQL).then(function(count) {
				page.recordsFiltered = count;
				return;
			});
		})
		.then(function() {
			
			// finally return the page object
			return page;
		})
		.catch(function() {
			
			// in the event there is an SQL error, send the page anyway
			// this error will occur if a partial regex string is evaluated
			return page;
		});
	}
	
	return {
		makePage: makePage
	};
};