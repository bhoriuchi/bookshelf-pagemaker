/**
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 * @description
 * Paginate Bookshelf Models
 * 
 * @module bookshelf-pagemaker
 * @param {bookshelf} bookshelf - An instance of bookshelf.
 * @returns {Object}
 */
module.exports = function(bookshelf) {
	
	
	// require external modules
	var _        = require('lodash');
	var qs       = require('qs');
	var promise  = require('bluebird');
	var dotprune = require('dotprune');
	var statics  = require('./core/statics');
	
	// environment initialization
	var env = {
		bookshelf : bookshelf,
		lodash    : _,
		qs        : qs,
		promise   : promise,
		dotprune  : dotprune,
		statics   : statics
	};
	
	
	// local module initialization
	env.utils   = require('./core/utils')(env);
	env.methods = require('./core/methods')(env);
	
	
	// return a function that accepts a bookshelf model
	// and an optional pagination configuration
	return function (model, pagination) {
		
		
		// set a pagination either by default or user specified
		if (_.has(statics.paginations, pagination)) {
			pagination = statics.paginations[pagination];
		}
		else if ((pagination) !== 'object') {
			pagination = statics.paginations.paged;
		}
		
		
		// set up the custom functions
		var protoProp = {
			_model      : model.extend({}),
			_pagination : pagination,
			end         : env.methods.end,
			fields      : env.methods.fields,
			href        : env.methods.href,
			limit       : env.methods.limit,
			offset      : env.methods.offset,
			order       : env.methods.order,
			paginate    : env.methods.paginate,
			search      : env.methods.search
		};
		
		// set up the class variables
		var classProp = {
			_pagination_var: {}
		};
		

		// extend the model with pagination functions and return it
		return model.extend(protoProp, classProp);
	};
};