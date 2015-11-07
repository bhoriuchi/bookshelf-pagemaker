// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: set pagination
//


module.exports = function(env) {

	var _JTYP      = env.statics.jsTypes;
	var _SRCH      = env.statics.search;
	var _STAT      = env.statics.httpStatus;
	var _ERR       = env.statics.errorCodes;
	var _ORD       = env.statics.order;
	
	var _          = env.lodash;
	var bookshelf  = env.bookshelf;
	var knex       = env.bookshelf.knex;
	var dotprune   = env.dotprune;
	var methodcore = env.methodcore;
	var utils      = env.utils;
	var u          = utils.util;
	
	
	// return the function
	return function(args) {
		
		var _self = this;
		var _qb   = _self.query().clone();

		
		_self._pagination_var = _.has(_self, '_pagination_var') ? _self._pagination_var : {};
		var _results          = _self._pagination_var.results || null;
		var pagination        = _self._pagination;
		
		// TODO move defaults to a statics module
		var limit      = 10;
		var max        = 100;
		var offset     = 0;
		var page       = 1;
		
		var srch, ordr, obj, err, sql, searchSQL, orderSQL;
		

		// check resolve input
		_self._pagination_var.results = u.resolveInput(null, _self).then(function(results) {
			
			// throw an error if the results are an error
			if (u.isErr(results.results)) {
				throw results.results;
			}
			
			// variables to store configuration and defaults
			var search     = [];
			var searchable = [];
			var orderable  = [];
			var order      = [];
			
			// check for a request object and update the current model options
			// with values compiled from the request and pagination configuration
			if (typeof(args.request) === _JTYP.object) {
				
				var req = args.request;
				
				// set the request
				_self._pagination_var.req = args.request;
				
				var p = (args.useQuery === true && req.query) ? req.query : req.params;
				
				
				// check for fields required to get the base uri
				if (_.has(req, 'headers.host') && _.has(req, 'connection')) {
					var protocol = req.connection.encrypted ? 'https://' : 'http://';
					_self._pagination_var.href = protocol + req.headers.host;
				}
				
				
				// look for request params
				if (p && pagination.input) {
					
					// set variables
					var i = pagination.input;
					var f = pagination.fields;
					var t = pagination.transforms;
					
					// get search parameter names
					var sp = _.has(i, 'search.param')              ? i.search.param              : 'search';
					var sv = _.has(i, 'search.fields.value')       ? i.search.fields.value       : 'value';
					var sr = _.has(i, 'search.fields.regex')       ? i.search.fields.regex       : 'regex';
					
					// get column parameter names
					var cp = _.has(i, 'columns.param')             ? i.columns.param             : 'columns';
					var cs = _.has(i, 'columns.fields.searchable') ? i.columns.fields.searchable : 'searchable';
					var co = _.has(i, 'columns.fields.orderable')  ? i.columns.fields.orderable  : 'orderable';
					var cn = _.has(i, 'columns.fields.name')       ? i.columns.fields.name       : 'name';
					var cd = _.has(i, 'columns.fields.data')       ? i.columns.fields.data       : 'data';
					
					// get the order parameter names
					var op = _.has(i, 'order.param')               ? i.order.param               : 'order';
					var oc = _.has(i, 'order.fields.column')       ? i.order.fields.column       : 'column';
					var od = _.has(i, 'order.fields.direction')    ? i.order.fields.direction    : 'dir';
					var dd = _.has(i, 'order.defaultDirection')    ? i.order.defaultDirection    : 'asc';
					
					// get the fields parameter
					if (_.has(p, 'fields')) {
						if (Array.isArray(p.fields)) {
							_self._pagination_var.fields = p.fields;
						}
						else if (p.fields && typeof(p.fields) === 'string') {
							_self._pagination_var.fields = p.fields.split(',');
						}
					}
					
					// get limit and offset params
					var lp = _.has(f, 'length.param') ? f.length.param : 'length';
					var ld = (_.has(f, 'length.defaultValue') && !isNaN(f.length.defaultValue)) ?
							 parseInt(f.length.defaultValue, 10) : limit;
					var lm = (_.has(f, 'length.maximum') && !isNaN(f.length.maximum)) ?
							 parseInt(f.length.maximum, 10) : max;
					var tp = _.has(f, 'start.param') ? f.start.param : 'start';
					var td = (_.has(f, 'start.defaultValue') && !isNaN(f.start.defaultValue)) ?
							 parseInt(f.start.defaultValue, 10) : offset;
					
					// get page parameters
					var pp = _.has(f, 'currentPage.param') ? f.currentPage.param : 'page';
					var pd = (_.has(f, 'currentPage.defaultValue') && !isNaN(f.currentPage.defaultValue)) ?
							 parseInt(f.currentPage.defaultValue, 10) : 1;
					
					// check for a global search field
					if (_.has(p, sp)) {
						
						// check type of search object
						if (p[sp] && typeof(p[sp]) === _JTYP.string) {
							
							search.push(u.newObj(_SRCH.search, p[sp]));
						}
						else if (p[sp] && typeof(p[sp]) === _JTYP.object) {
							
							srch = {};
							srch.search = (typeof(p[sp][sv]) === _JTYP.string)  ? p[sp][sv] : null;
							srch.type   = (typeof(p[sp][sr]) === true) ? _SRCH.regex : _SRCH.basic;
							search.push(srch);
						}
					}
					
					// check for columns
					if (_.has(p, cp)) {
						
						// check that columns is an array
						if (Array.isArray(p[cp])) {
							
							// loop through each column and look for its search
							_.forEach(p[cp], function(col) {
								
								// check type of search object
								if (col[sp] && col[cd] && typeof(col[sp]) === _JTYP.string) {
									
									srch = {};
									srch.search = col[sp];
									srch.field  = col[cd];
									
									if (col[cs] !== false) {
										searchable.push(col[cd]);
										search.push(srch);
									}
								}
								else if (col[sp] && col[cd] && typeof(col[sp]) === _JTYP.object) {
									
									srch = {};
									srch.search = (typeof(col[sp][sv]) === _JTYP.string)  ? col[sp][sv] : null;
									srch.type   = (typeof(col[sp][sr]) === true) ? _SRCH.regex : _SRCH.basic;
									srch.field  = col[cd];

									if (col[cs] !== false) {
										searchable.push(col[cd]);
										search.push(srch);
									}
								}
							});
						}
					}
					
					// check for ordering
					if (_.has(p, op)) {
						
						if (typeof(p[op]) === _JTYP.string) {
							
							// split the string into fields
							ordr = p[op].split(',');
							
							// loop through the fields and split each into a column
							// and direction
							for (var j = 0; j < ordr.length; j++) {
								ordr[j] = ordr[j].split('.');
								
								if (ordr[j].length < 2 ||
										(ordr[j][1] !== _ORD.ascending &&
												ordr[j][1] !== _ORD.descending)) {
									ordr[j][1] = dd;
								}
								
								// set the order
								obj = {};
								obj.field     = ordr[j][0];
								obj.direction = ordr[j][1];
								order.push(obj);
							}
							
						}
						// check that the order parameter is an array
						else if (Array.isArray(p[op])) {
							
							// loop through each order element
							_.forEach(p[op], function(o) {
								
								// check for a string
								if (typeof(o) === _JTYP.string) {
									ordr = o.split('.');
									
									if (ordr.length < 2 ||
											(ordr[1] !== _ORD.ascending &&
													ordr[1] !== _ORD.descending)) {
										ordr[1] = dd;
									}
									
									obj = {};
									obj.field     = ordr[0];
									obj.direction = ordr[1];
									order.push(obj);
								}
								else if (typeof(o) === _JTYP.object) {
									
									// check for column property type
									if (o[oc]) {
										
										// check if the column value is a string and not a number
										if (isNaN(o[oc]) && typeof(o[oc]) === _JTYP.string) {
											
											obj = {};
											obj.field = o[oc];
											obj.direction = (o[od] === _ORD.ascending ||
													o[od] === _ORD.descending) ? o[od] : dd;
											order.push(obj);
										}
										// check for an index value (jquery datatables)
										else if (!isNaN(o[oc])) {
											
											var idx = parseInt(o[oc], 10);
											
											// check for columns
											if (Array.isArray(p[cp]) &&
													idx < p[cp].length &&
													p[cp][idx][co] !== false &&
													typeof(p[cp][idx][cd]) === _JTYP.string) {
												
												obj = {};
												obj.field = p[cp][idx][cd];
												obj.direction = (o[od] === _ORD.ascending ||
														o[od] === _ORD.descending) ? o[od] : dd;
												order.push(obj);
											}
										}
									}
								}
							});
						}
					}
					
					
					_self._pagination_var.limit = (_.has(p, lp) &&
						       !isNaN(p[lp]) &&
						       parseInt(p[lp], 10) <= lm) ?
						       parseInt(p[lp], 10) : ld;
					
					// if the request has a page property
					if (_.has(p, pp) && pagination.usePages === true) {
						var curPage   = !isNaN(p[pp]) ? parseInt(p[pp], 10) : pd;
						_self._pagination_var.offset = (_self._pagination_var.limit * (curPage - 1));
					}
					
					// if the request has a start property
					else if (_.has(p, tp)) {
						
						_self._pagination_var.offset = !isNaN(p[tp]) ? parseInt(p[tp], 10) : td;
					}
					
					// throw an error if the offset is less than 0
					if (_self._pagination_var.offset < 0) {
						
						// throw an error
						throw u.newErr(
							_STAT.NOT_FOUND.code,
							_ERR.NOT_FOUND.detail,
							_ERR.NOT_FOUND.code,
							['The page does not exist', 'thrown from paginate']
						);
					}
				}
				
				
				// set default limit and offset
				_self._pagination_var.limit  = _self._pagination_var.limit  || limit;
				_self._pagination_var.offset = _self._pagination_var.offset || offset;
				limit  = _self._pagination_var.limit;
				
				// check for a page and update the offset
				if (_self._pagination_var.page) {
					_self._pagination_var.offset = (_self._pagination_var.page * limit) - limit;
				}
				offset = _self._pagination_var.offset;
				
				// set searchable
				searchable = (searchable.length > 0) ? searchable : null;
				
				// set options
				if (search.length > 0) {
					methodcore.search(search, searchable, _self);
				}
				if (order.length > 0) {
					methodcore.order(order, _self);
				}
			}
			else {
				args = {};
			}
			
			// get a list of columns in order to compose order and search sql
			return knex(_self.tableName).columnInfo().then(function(info) {
				
				// set the schema
				_self._pagination_var.schema = info;
				
				// determine the orderSQL
				sql = '';
				_.forEach(_self._pagination_var.order, function(o) {
					
					// prepare the current order object
					var oo = utils.order.prepareOrderObject(o, _self.tableName, info);
					
					// if the object is not null, add it
					if (oo) {
						sql = (sql !== '') ? sql + ',' : sql;
						sql += oo.field + ' ' + oo.direction;
					}
				});
				
				// set the order SQL
				orderSQL = sql || null;
				
				
				// loop through each search and compile an sql statement
				sql = '';
				_.forEach(_self._pagination_var.search, function(obj, column) {
					
					// set the column sql to the concat of each field value is on the all column
					if (column === _SRCH._all) {
						
						// get the column fields
						column = utils.search.getColumnConcat(_self.tableName, info);

						// if there was a result
						if (column !== '') {
							column = "concat_ws('|'" + column + ")";
						}
					}

					// if the search is basic, get the keyword search SQL
					if (column !== '') {
						if (obj.type === _SRCH.basic) {
							sql += utils.search.getKeywordSQL(obj.search, column);
						}
						
						// otherwise get the regex search SQL
						else {
							sql += utils.search.getRegexSQL(obj.search, column);
						}
					}
				});
				
				
				// set the _searchSQL value and return the model
				searchSQL = (sql === '') ? '1 = 1' : sql + '1 = 1';
				
				
				// define a pagination function that takes a transaction
				var getPagination = function(t) {
					
					// set transaction
					_self._pagination_var.transaction = t;
					args.transacting                  = t;
					
					// get the filtered count
					return _qb.count('* as count')
					.andWhereRaw(searchSQL)
					.transacting(t)
					.then(function(count) {
						
						// set the results
						if (Array.isArray(count) && count.length > 0) {
							
							// set the filtered results
							_self._pagination_var.filteredResults = count[0].count;
						}
					})
					.then(function() {
						
						// run a query to get the filtered results
						return _self.query(function(qb) {
							
							// update any optional SQL
							qb = searchSQL    ? qb.andWhereRaw(searchSQL)    : qb;
							qb = orderSQL     ? qb.orderByRaw(orderSQL)      : qb;
							qb = limit        ? qb.limit(limit)              : qb;
							qb = offset       ? qb.offset(offset)            : qb;
						})
						.fetchAll(_.omit(args, 'request'))
						.then(function(results) {
							
							// set the results
							if (results) {

								// convert the results to json
								results = results.toJSON(_.omit(args, 'request'));
								
								// if fields were specified, prune them
								if (Array.isArray(_self._pagination_var.fields)) {
									results = dotprune.prune(results, _self._pagination_var.fields);
								}
								
								return utils.pagination.paginate(_self, results)
								.then(function(results) {
									_self._pagination_var.results = results;
									return results;
								});
							}
							else {
								return env.utils.util
								.wrapPromise(env.statics.httpStatus.NO_CONTENT);
							}
						});
					});
				};
				
				
				// use a transaction
				if (_self._pagination_var.transaction) {
					return getPagination(_self._pagination_var.transaction);
				}
				else if (args.transacting) {
					return getPagination(args.transacting);
				}
				else {
					return bookshelf.transaction(function(t) {
						return getPagination(t);
					});
				}
			});
		})
		.caught(function(e) {

			// create a new error
			err = u.newErr(
				e.errno,
				'An error was thrown during the paginate transaction',
				e.code,
				e.message,
				e.stack
			);
			
			// check if the error was thrown by factory or knex/bookshelf
			err = u.isErr(e) ? e : err;
			
			// check if errors should be thrown. usually used for
			// a chained transaction				
			if (_self._pagination_var.throwErrors) {
				throw err;
			}
		
			// return the error
			return u.wrapPromise(err);
		});

		return _self;
	};
};