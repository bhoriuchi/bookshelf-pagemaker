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
	}
};





// initialize modules
var Promise     = require('bluebird');
var restify     = require('restify');
var knex        = require('knex')(db);
var bookshelf   = require('bookshelf')(knex);
var fs          = require('fs');
var path        = require('path');





// here we initialize pagemaker with a bookshelf instance
// the bookshelf instance will be used to set up models
// and query the database for records
var pagemaker   = require('../lib/pagemaker')(bookshelf);





// set up demo variables
var testTable	= 'pagemaker_demo';
var data_file   = path.resolve('./sample-data.json');
var dt_html     = path.resolve('./datatables.html');





// promisify fs
Promise.promisifyAll(fs);





//define the test model
var TestModel = bookshelf.Model.extend({
	tableName: testTable
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





// create demo table and load test data
knex.schema.dropTableIfExists(testTable).then(function() {
	return knex.schema.createTable(testTable, function(table) {
		table.integer('id').primary();
		table.string('original_title', 300);
		table.string('original_language', 10);
		table.string('release_date', 100);
		table.string('title', 300);
		table.float('popularity');
	})
	.then(function() {
		
		fs.readFileAsync(data_file, 'utf8')
		.catch(SyntaxError, function(e) {
			console.error("invalid json in file");
		})
		.catch(function(e) {
			console.error("unable to read file");
		})
		.then(function(data) {
			var dataObj = JSON.parse(data);
			return knex.table(testTable).insert(filterData(dataObj));
		});
	});
});





// function to display the datatables example html
function makeDatatablesHtml(req, res, next) {
	fs.readFileAsync(dt_html, 'utf8')
	.catch(SyntaxError, function(e) {
		console.error("invalid html in file");
	})
	.catch(function(e) {
		console.error("unable to read file");
	})
	.then(function(html) {
		res.send(html);
		return next();
	});
}





// function to paginate in datatables format
function makeDatatables(req, res, next) {

	// this section of code is where pagemaker is actually used
	// each supported pagination format will have its own key 
	// and paginate function in the main pagemaker object 
	// the paginate function will return a promise with the results
	pagemaker.datatables.paginate(req.params, TestModel).then(function(result) {
		
		// you can then use the results as you like
		// since the example uses restify, it sends the result
		res.send(result);
		return next();
	});
}





// function to make data tables
function makePagemaker(req, res, next) {
	//console.log(req);
	
	var http_type = (req.connection.encrypted) ? 'https://' : 'http://';
	var baseURI = http_type + req.headers.host + req.route.path;
	console.log(baseURI);
	
	pagemaker.pagemaker.paginate(req.params, TestModel, baseURI).then(function(result) {
		
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
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser());
server.use(restify.CORS());





// set up routes
server.get('/pagemaker/datatables', makeDatatables);
server.get('/pagemaker/datatables/example', makeDatatablesHtml);
server.get('/pagemaker/pagemaker', makePagemaker);



// start the server
server.listen(8080, function() {
	console.log('Test Server %s listening at %s', server.name, server.url);
});
