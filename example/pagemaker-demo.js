// Examples of how to use pagemaker
// The majority of the example is setting up a basic
// API using restify, bookshelf, and knex
// to test, run this file as a node application
//
// A datatables test page has been set up at //<your server>/pagemaker/datatables/example





// create database connection configuration
// fill in your own details here
var db = {
	"client": "mysql",
	"connection": {
		"host": "127.0.0.1",
		"user": "db",
		"password": "password",
		"database": "pagemaker",
		"charset": "utf8"
	},
	"debug": false
};





// initialize modules
var Promise      = require('bluebird');
var restify      = require('restify');
var knex         = require('knex')(db);
var bookshelf    = require('bookshelf')(knex);
var fs           = require('fs');
var path         = require('path');




// here we initialize pagemaker with a bookshelf instance
// the bookshelf instance will be used to set up models
// and query the database for records
var pagemaker    = require('../lib/pagemaker')(bookshelf);
var sample       = require('./sample-data');




// set up demo variables
var movieTable   = 'movie';
var userTable    = 'user';
var starredTable = 'movie_user';
var dt_html      = path.resolve('./datatables.html');





// promisify fs
Promise.promisifyAll(fs);





//define the test models
var MovieModel = bookshelf.Model.extend({
	tableName: movieTable
});
var UserModel = bookshelf.Model.extend({
	tableName: userTable,
	watchLater: function() {
		return this.belongsToMany(MovieModel);
	}
});



// creates a new array of objects with only the required demo data
function filterData(data) {
	var filteredData = [];
	var keys = [];
	for(var i = 0; i < data.length; i++) {
		var d = data[i];
		if (keys.indexOf(d.id) === -1) {
			keys.push(d.id);
			filteredData.push({
				id: d.id,
				original_title: d.original_title,
				original_language: d.original_language,
				release_date: d.release_date,
				title: d.title,
				popularity: d.popularity
			});
		}
	}
	return filteredData;
}





// create demo tables and load test data
knex.schema.dropTableIfExists(movieTable).then(function() {
	return knex.schema.createTable(movieTable, function(table) {
		table.integer('id').primary();
		table.string('original_title', 300);
		table.string('original_language', 10);
		table.string('release_date', 100);
		table.string('title', 300);
		table.float('popularity');
	})
	.then(function() {
		
		return knex.table(movieTable).insert(filterData(sample.movies));
		
	});
});
knex.schema.dropTableIfExists(userTable).then(function() {
	return knex.schema.createTable(userTable, function(table) {
		table.integer('id').primary();
		table.string('first_name', 100);
		table.string('last_name', 100);
	})
	.then(function() {
		
		return knex.table(userTable).insert(sample.users);
		
	});
});
knex.schema.dropTableIfExists(starredTable).then(function() {
	return knex.schema.createTable(starredTable, function(table) {
		table.integer('user_id');
		table.integer('movie_id');
	})
	.then(function() {
		
		return knex.table(starredTable).insert(sample.starred);
		
	});
});



// function to display the datatables example html
function makeDatatablesHtml(req, res, next) {
	fs.readFileAsync(dt_html, 'utf8')
	.then(function(html) {
		res.send(html);
		return next();
	});
}





// function to paginate in datatables format
function makeDatatables(req, res, next) {

	// define an argument object. datatables only requires the params and model
	var args = {
			params: req.params,
			model: MovieModel
	};
	
	// this section of code is where pagemaker is actually used
	// each supported pagination format will have its own key 
	// and paginate function in the main pagemaker object 
	// the paginate function will return a promise with the results
	pagemaker.datatables.paginate(args).then(function(result) {
		
		// you can then use the results as you like
		// since the example uses restify, it sends the result
		res.send(result);
		return next();
	});
}





// function to make data tables
function makePagemaker(req, res, next) {

	var http_type = (req.connection.encrypted) ? 'https://' : 'http://';
	var baseURI = http_type + req.headers.host + req.url;

	// define an argument object. since pagemaker uses next and previous it will take
	// the uri property as well
	var args = {
		params: req.params,
		model: MovieModel,
		uri: baseURI
	};
	
	// call the paginate function
	pagemaker.pagemaker.paginate(args).then(function(result) {
		
		res.send(result);
		return next();
	});
}

var getId = function(qb) {
	qb.select('id');
};

//function to make data tables
function makeTest(req, res, next) {

	var model, relations;
	
	// get the base uri
	var http_type = (req.connection.encrypted) ? 'https://' : 'http://';
	var baseURI = http_type + req.headers.host + req.url;
	
	console.log(req);
	
	// determine the model to use
	if (req.params.type === 'user') {
		model = UserModel;
		relations = ['watchLater'];
	}
	else if (req.params.type === 'movie') {
		model = MovieModel;
		relations = [];
	}
	
	// create the argument object
	var args = {
			params: req.params,
			model: model,
			uri: baseURI,
			relations: relations
	};
	
	pagemaker.pagemaker.paginate(args).then(function(result) {
		res.send(result);
		return next();
	});
}


// create restify config
var r_config = {
		formatters: {
			'text/html': function(req, res, body) {
				return body;
			}
		}
};





// set up the restify server with CORS enabled and body/query parsers
var server = restify.createServer(r_config);
server.pre(restify.pre.sanitizePath());
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());
server.use(restify.CORS());


// set up routes
server.get('/pagemaker/datatables', makeDatatables);
server.get('/pagemaker/datatables/example', makeDatatablesHtml);
server.get('/pagemaker/pagemaker', makePagemaker);
server.get('/pagemaker/test/:type', makeTest);

// start the server
server.listen(8080, function() {
	console.log('Test Server %s listening at %s', server.name, server.url);
});
