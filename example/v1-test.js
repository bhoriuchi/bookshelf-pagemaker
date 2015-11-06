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

//initialize modules and variables
var _            = require('lodash');
var restify      = require('restify');
var knex         = require('knex')(db);
var bookshelf    = require('bookshelf')(knex);
var pm           = require('../lib/pagemaker')(bookshelf);
var sample       = require('./sample-data');
var movieTable   = 'movie';
var userTable    = 'user';
var starredTable = 'movie_user';


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

//creates a new array of objects with only the required demo data
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

//create demo tables and load test data
knex.schema.dropTableIfExists(movieTable)
.then(function() {
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
})
.then(function() {
	return knex.schema.dropTableIfExists(userTable).then(function() {
		return knex.schema.createTable(userTable, function(table) {
			table.integer('id').primary();
			table.string('first_name', 100);
			table.string('last_name', 100);
		})
		.then(function() {
			return knex.table(userTable).insert(sample.users);
		});
	});
})
.then(function() {
	return knex.schema.dropTableIfExists(starredTable).then(function() {
		return knex.schema.createTable(starredTable, function(table) {
			table.integer('user_id');
			table.integer('movie_id');
		})
		.then(function() {
			return knex.table(starredTable).insert(sample.starred);
		});
	});
})
.then(function() {

	var getUsers = function(req, res, next) {
		
		pm(UserModel).forge()
		//.fields('foo,bar')
		//.href('http://blah/')
		//.limit(2)
		//.offset(0)
		//.order('title.desc,popularity')
		//.search('test')
		.paginate({
			request: req,
			withRelated: ['watchLater'],
			omitPivot: true
		})
		.end()
		.then(function(result) {
			res.send(result);
			return next();

		});
	};
	
	
	var getDatatables = function(req, res, next) {

		pm(MovieModel, 'datatables').forge()
		.paginate({
			request: req
		})
		.end()
		.then(function(result) {
			res.send(result);
			return next();

		});
	};

	// set up the restify server with CORS enabled and body/query parsers
	var server = restify.createServer();
	server.pre(restify.pre.sanitizePath());
	server.use(restify.bodyParser({ mapParams: false }));
	server.use(restify.queryParser());
	server.use(restify.CORS());
	server.use(restify.acceptParser(server.acceptable));


	// routes
	server.get('/api/users', getUsers);
	server.get('/api/datatables', getDatatables);

	console.log(__dirname);
	
	// datatables route
	server.get(/\/datatables\/?.*/, restify.serveStatic({
		directory: __dirname + '/public',
		'default': 'index.html'
	}));
	
	
	//start the server
	server.listen(8080, function() {
		console.log('Test Server %s listening at %s', server.name, server.url);
	});
});
