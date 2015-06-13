

# bookshelf-pagemaker

## Install

```bash
npm install -g bookshelf-pagemaker
```

## Examples

##### Pagemaker Sample Code
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
##### Pagemaker sample output
```js
{
    "currentPage": 2,
    "previous": "http://127.0.0.1:8080/pagemaker/test?page=1",
    "next": "http://127.0.0.1:8080/pagemaker/test?page=3",
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

### Models with relations
```js
var pm = require('bookshelf-pagemaker')(bookshelf);
var Movies = bookshelf.Model.extend({
	tableName: 'movies'
});
var User = bookshelf.Model.extend({
	tableName: 'user',
	watchLater: function() {
		return this.belongsToMany(Movie); // define relation
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
##### Output with relations
```js
{
    "currentPage": 1,
    "previous": null,
    "next": "http://127.0.0.1:8080/pagemaker/test?page=2",
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

## Usage


```js
var pagemaker = require('bookshelf-pagemaker')(bookshelf);
```


### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
