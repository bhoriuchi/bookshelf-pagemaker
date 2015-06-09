// build your own pagination
// accepts a pagination configuration


module.exports = function(config) {
	
	var util                 = config.util;
	var bookshelf            = config.bookshelf;
	var dbTypes              = config.dbTypes;
	var Promise              = config.Promise;
	var qs                   = config.qs;
	var page_styles          = { "page": "page", "offset": "offset" };
	var param_types          = { "integer": "integer", "string": "string" };

	
	
	
	
	// main function to produce a paginated result
	function makePage(params, Model, cfg, baseURI) {
		
		
		// set defaults and make next/previous calculations
		var length           = parseInt(params[cfg.pageSize.param], 10) || cfg.pageSize.defaultValue;
		var start            = parseInt(params[cfg.offset.param], 10) || cfg.offset.defaultValue;
		var pageNumber       = parseInt(params[cfg.page.param], 10) || cfg.page.defaultValue;
		var prevOffset       = ((start - length) >= 0) ? (start - length) : null;
		var prevPage         = (pageNumber > 1) ? (pageNumber - 1) : null;
		var nextOffset       = (start + length);
		var nextPage         = pageNumber + 1;
		
		
		// initialize variables
		var page             = {};
		var pageData         = [];
		var filterSQL        = '';
		baseURI              = baseURI || '';
		
		
		
		
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

		
		
		
		
		// add passthroughs. check that the passthrough config is present and that there is a param
		// that matches each passthrough. convert the passthrough to a specific type if necessary
		if (typeof (cfg.passthrough) === 'object' && Array.isArray(cfg.passthrough)) {
			for(var i = 0; i < cfg.passthrough.length; i++) {
				var pt = cfg.passthrough[i];
				if (util.hasProperties(pt, ['param', 'type', 'field']) && params.hasOwnProperty(pt.param)) {
					if (pt.type === param_types.integer) {
						page[pt.field] = parseInt(params[pt.param], 10) || -1;
					}
					else {
						page[pt.field] = params[pt.param];
					}
				}
			}
		}
		
		
		
		
		
		// create 2 model instances. the first will be used to get the results
		// and the second will be used to get the counts
		var m1               = new Model();
		var m2               = new Model();
		
		
		
		
		
		// query variable will be used to build a query that has sort and filter options
		var query = m1.query();
		
				

		
		
		// get the columns
		return m2.query().columnInfo().then(function(info) {

			// get the column names
			return Object.keys(info);
			
		})
		.then(function(columns) {
			
			// get the updated query with ordering
			query = util.getOrder(columns, params, cfg, query);

			// get the filter sql
			var concatSQL = util.getColumnConcatSQL(columns, params, cfg);
			filterSQL = util.getFilterSQL(columns, params, cfg, concatSQL);
			query = query.whereRaw(filterSQL);

		})
		.then(function() {
			
			// get only the required results as data
			return query.offset(start).limit(length).then(function(data) {
				
				pageData = data;
				
				return data;
			});
		})
		.then(function() {

			// set filtered to the total records
			filterSQL = (filterSQL !== '') ? filterSQL : '1 = 1';
	
			// get the filtered results count
			return util.getTotalFilteredRecords(m2, filterSQL).then(function(count) {
				
				// show previous
				if (cfg.next.show && baseURI !== '') {
					
					var newParam  = {};
					var lastPage  = Math.ceil(count / length);
					nextPage      = (nextPage <= lastPage) ? nextPage : null;
					nextOffset    = (nextOffset < count) ? nextOffset : null;
					
					if (cfg.style.type === page_styles.page && nextPage !== null) {
						newParam[cfg.page.param] = nextPage;
						page[cfg.next.field] = util.regenerateURI(baseURI, params, newParam, {}, qs);
					}
					else if (cfg.style.type === page_styles.offset && nextOffset !== null) {
						newParam[cfg.offset.param] = nextOffset;
						page[cfg.next.field] = util.regenerateURI(baseURI, params, newParam, {}, qs);
					}
					else {
						page[cfg.next.field] = null;
					}
				}
				
				if (cfg.filteredCount.show) {
					page[cfg.filteredCount.field] = count;
				}
				
				return;
			});
		})
		.then(function() {
			
			if (cfg.count.show) {
				
				// get the total records
				return util.getTotalRecords(m2).then(function(count) {
					page[cfg.count.field] = count;
					return;
				});
			}
			return;
		})
		.then(function() {
			
			// show the data
			if (cfg.data.show) {
				page[cfg.data.field] = pageData;
			}

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
