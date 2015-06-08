// build your own pagination
// accepts a pagination configuration


module.exports = function(config) {
	
	var util                 = config.util;
	var bookshelf            = config.bookshelf;
	var dbTypes              = config.dbTypes;
	var Promise              = config.Promise;
	var qs                   = config.qs;
	var page_styles          = { "page": "page", "offset": "offset" };
	var search_directions    = { "asc": "asc", "desc": "desc" };
	
	
	
	function makePage(params, Model, page_config, baseURI) {
		
		// parse the configuration to an object
		var cfg              = JSON.parse(page_config);
		baseURI              = baseURI || '';
		
		// verify the configuration and return a promise if
		// the validation fails
		if (!util.isValidByoConfig(cfg)) {
			console.log('invalid config');
			return new Promise(function(resolve) {
				resolve({'error': 'invalid page configuration'});
			});
		}

		
		// get the length of results to show per page
		var length           = parseInt(params[cfg.pageSize.param], 10) || cfg.pageSize.default;
		var start            = parseInt(params[cfg.offset.param], 10) || cfg.offset.default;
		var pageNumber       = parseInt(params[cfg.page.param], 10) || cfg.page.default;
		var prevOffset       = ((start - length) >= 0) ? (start - length) : null;
		var prevPage         = (pageNumber > 1) ? (pageNumber - 1) : null;
		var page             = {};
		var filterSQL        = '';
		
		// if page style is page then calculate the start index based on the page number
		if (cfg.style.type === page_styles.page) {
			
			// get the page number from the params. none specified use the config default
			// if the specified is less than 1, set it to 1 and then calculate the start offset
			pageNumber       = (pageNumber > 0) ? pageNumber : 1;
			start            = (pageNumber * length) - length;
			
			// show the page number
			if (cfg.page.show) {
				page[cfg.page.field] = pageNumber;
			}
		}
		else if (cfg.style.type === page_styles.offset && cfg.offset.show) {
			page[cfg.offset.field] = start;
		}
		
		
		// show the page size
		if (cfg.pageSize.show) {
			page[cfg.pageSize.field] = length;
		}
		
		
		// show previous
		if (cfg.previous.show && baseURI !== '') {
			
			var startPram = '';
			var newParam = {};
			
			if (cfg.style.type === page_styles.page && prevPage !== null) {
				newParam[cfg.page.param] = prevPage;
				page[cfg.previous.field] = util.regenerateURI(baseURI, params, newParam, {}, qs);
			}
			else if (cfg.style.type === page_styles.offset && prevOffset !== null) {
				newParam[cfg.offset.param] = prevOffset;
				page[cfg.previous.field] = util.regenerateURI(baseURI, params, newParam, {}, qs);
			}
			else {
				page[cfg.previous.field] = null;
			}
		}

		
		// add passthroughs
		for(var i = 0; i < cfg.passthrough.length; i++) {
			var pt = cfg.passthrough[i];
			if (params.hasOwnProperty(pt.param)) {
				if (pt.type === 'integer') {
					page[pt.field] = parseInt(params[pt.param], 10) || -1;
				}
				else {
					page[pt.field] = params[pt.param];
				}
			}
		}
		
		
		// create a model instance and get the tableName
		// for use in the knex query
		var m                = new Model();
		var tableName        = m.tableName;
		
		
		// construct a base knex object for the query
		var query            = bookshelf.knex.select()
                             .table(tableName);
		
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
