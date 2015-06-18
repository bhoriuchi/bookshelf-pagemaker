

# bookshelf-pagemaker
---
# &nbsp;
# Install
---
```bash
npm install -g bookshelf-pagemaker
```
# &nbsp;
# Search & Order
---
Search and order functionality can be enabled or disabled in the pagination configuration. For basic
pagination configurations a parameter will be defined that identifies the query string parameter value 
that will be used to search or order the results. This is configurable in the custom pagination and defaults
to "search" and "sort" in the pagemaker pagination
<br><br>
Complex options are available for searching and ordering specific columns. The Datatables pagination takes advantage of complex


# &nbsp;

# Examples
---
## Basic Example

##### JavaScript
```js
// this example assumes that req is an object containing all
// request parameters passed in similar to restify
var pm = require('bookshelf-pagemaker')(bookshelf);
var Movies = bookshelf.Model.extend({
	tableName: 'movies'
});

// optional, obtain the uri for use with next/previous
var http_type = (req.connection.encrypted) ? 'https://' : 'http://';
var baseURI = http_type + req.headers.host + req.url;

// create an arguments object
var args = {
    params: req.params,
    model: Movies,
    uri: baseURI
};

// now call the appropriate paginate function and pass the args
// then use another function to process the results
pm.pagemaker.paginate(args).then(function(result) {
    myFunctionThatDoesSomethingWith(result);
});

```
##### Output
```js
{
    "currentPage": 2,
    "previous": "http://127.0.0.1:8080/pagemaker/movies?page=1",
    "next": "http://127.0.0.1:8080/pagemaker/movies?page=3",
    "totalPages": 68,
    "totalFiltered": 135,
    "totalRecords": 135,
    "results": [
        {
            "id": 121,
            "original_title": "The Lord of the Rings: The Two Towers",
            "original_language": "en",
            "release_date": "2002-12-18",
            "title": "The Lord of the Rings: The Two Towers",
            "popularity": 4.71
        },
        {
            "id": 122,
            "original_title": "The Lord of the Rings: The Return of the King",
            "original_language": "en",
            "release_date": "2003-12-01",
            "title": "The Lord of the Rings: The Return of the King",
            "popularity": 4.95
        }
    ]
}
```
# &nbsp;
### Models with relations

##### JavaScript
```js
var pm = require('bookshelf-pagemaker')(bookshelf);
var Movies = bookshelf.Model.extend({
	tableName: 'movies'
});
var User = bookshelf.Model.extend({
	tableName: 'user',
	watchLater: function() {
		return this.belongsToMany(Movies); // define relation
	}
});

// optional, obtain the uri for use with next/previous
var http_type = (req.connection.encrypted) ? 'https://' : 'http://';
var baseURI = http_type + req.headers.host + req.url;

// create an arguments object like in the first example, but this time add
// a relations field with an array of relations to load
var args = {
    params: req.params,
    model: Users,
    uri: baseURI,
    relations: ['watchLater']
};

// now call the appropriate paginate function and pass the args
// then use another function to process the results
pm.pagemaker.paginate(args).then(function(result) {
    myFunctionThatDoesSomethingWith(result);
});
```
##### Output
```js
{
    "currentPage": 1,
    "previous": null,
    "next": "http://127.0.0.1:8080/pagemaker/users?page=2",
    "totalPages": 6,
    "totalFiltered": 12,
    "totalRecords": 12,
    "results": [
        {
            "id": 1,
            "first_name": "Hugo",
            "last_name": "Reyes",
            "watchLater": [
                {
                    "id": 122917,
                    "original_title": "The Hobbit: The Battle of the Five Armies",
                    "original_language": "en",
                    "release_date": "2014-12-17",
                    "title": "The Hobbit: The Battle of the Five Armies",
                    "popularity": 18.82
                },
                {
                    "id": 152424,
                    "original_title": "The Universe (History channel) Stagione1 - La Fine della Terra",
                    "original_language": "it",
                    "release_date": "2007-05-29",
                    "title": "The Universe",
                    "popularity": 1
                }
            ]
        },
        {
            "id": 2,
            "first_name": "Sayid",
            "last_name": "Jarrah",
            "watchLater": []
        }
    ]
}
```
# &nbsp;
### jQuery Datatables

##### JavaScript
```js
// this example assumes that req is an object containing all
// request parameters passed in similar to restify
var pm = require('bookshelf-pagemaker')(bookshelf);
var Movies = bookshelf.Model.extend({
	tableName: 'movies'
});

// create an arguments object
var args = {
    params: req.params,
    model: Movies
};

// now call the appropriate paginate function and pass the args
// then use another function to process the results
pm.datatables.paginate(args).then(function(result) {
    myFunctionThatDoesSomethingWith(result);
});

```

# Custom 
A custom pagination configuration can be defined and passed to the custom pagination function.
##### JavaScript
```js
// this example assumes that req is an object containing all
// request parameters passed in similar to restify
var pm = require('bookshelf-pagemaker')(bookshelf);
var Movies = bookshelf.Model.extend({
	tableName: 'movies'
});

var http_type = (req.connection.encrypted) ? 'https://' : 'http://';
var baseURI = http_type + req.headers.host + req.url;
	
// define a custom pagination scheme
var custom = {
	"style": {
		"type": "offset"
	},
	"data": {
		"show": true,
		"field": "records"
	},
	"pageSize": {
		"show": false,
		"field": "limit",
		"defaultValue": 10,
		"maximum": 1000,
		"param": "limit"
	},
	"offset": {
		"show": false,
		"field": "offset",
		"defaultValue": 0,
		"param": "offset"
	},
	"page": {
		"show": false,
		"field": "currentPage",
		"defaultValue": 1,
		"param": "page"
	},
	"pageCount": {
		"show": false,
		"field": "totalPages"
	},
	"count": {
		"show": true,
		"field": "totalRecords"
	},
	"filteredCount": {
		"show": true,
		"field": "totalFiltered"
	},
	"previous": {
		"show": true,
		"field": "previous"
	},
	"next": {
		"show": true,
		"field": "next"
	},
	"search": {
		"enabled": true,
		"param": "search",
		"regexParam": "regex",
		"complex": false
	},
	"order": {
		"enabled": true,
		"param": "sort",
		"defaultDirection": "asc",
		"complex": false
	},
	"complex": {
		"enabled": false,
		"param": "columns",
		"fieldName": "data",
		"searchable": "searchable",
		"orderable": "orderable",
		"search": {
			"key": "search",
			"value": "value",
			"regex": "regex"
		},
		"order": {
			"key": "order",
			"field": "column",
			"direction": "dir"
		}
	}
};
	
// define an argument object
var args = {
	params: req.params,
	model: Movies,
	uri: baseURI,
	config: custom
};
	
// call the paginate function
pm.custom.paginate(args).then(function(result) {
    myFunctionThatDoesSomethingWith(result);
});
```

# &nbsp;
## Usage
---
```js
var pagemaker = require('bookshelf-pagemaker')(bookshelf);
```

# &nbsp;
### Tools
---
Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.