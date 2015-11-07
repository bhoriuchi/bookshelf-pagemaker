

# ☰ bookshelf-pagemaker ☰
---

`bookshelf-pagemaker` allows you to paginate results from [`bookshelf.js`](http://bookshelfjs.org/) queries by extending your user defined model with several helper functions and replacing the `fetchAll` method with a custom `paginate` method. `bookshelf-pagemaker` also has built in support for handling express style request objects in order to sort, order, search, limit, and offset your results. In addition to all of these extended methods, the pagination formatting is also customizable based on your requirement. Out of the box `bookshelf-pagemaker` has pagination configurations for a simple paged pagination, offset pagination, and [`jQuery datatables`](https://www.datatables.net/) pagination.


* See the [WIKI](https://github.com/bhoriuchi/bookshelf-pagemaker/wiki) for full documentation
* And the [Change Log](https://github.com/bhoriuchi/bookshelf-pagemaker/wiki/Change-Log) for what's new

---


## Documentation
---
* [`API 1.x`](https://github.com/bhoriuchi/bookshelf-pagemaker/wiki/API-1.0)
* [`Pagination Configuration`](https://github.com/bhoriuchi/bookshelf-pagemaker/wiki/Pagination-Configuration)

---

## Examples

##### Basic Example

```js
var pm = require('bookshelf-pagemaker')(bookshelf);

var User = bookshelf.Model.extend({
    tableName: 'users'
});

pm(User).forge()
.limit(2)
.page(2)
.paginate()
.end()
.then(function(results) {
	console.log(JSON.stringify(results, null, '  '));
});

```
##### Results

```js
{
    "previous": 1,
    "current": "2",
    "next": "3",
    "limit": 2,
    "pagesTotal": 6,
    "pagesFiltered": 6,
    "resources": [
        {
            "id": 3,
            "first_name": "Jack",
            "last_name": "Shephard",
            "watchLater": []
        },
        {
            "id": 4,
            "first_name": "James",
            "last_name": "Ford",
            "watchLater": []
        }
    ]
}
```

---

##### Express Request with datatables Example

```js
var pm = require('bookshelf-pagemaker')(bookshelf);

var User = bookshelf.Model.extend({
    tableName: 'users'
});

function getUser(req, res, next) {
    pm(User, 'datatables').forge()
    .paginate({
        request: req
    })
    .end()
    .then(function(results) {
	    res.send(results);
        return next();
    });
}

server.get('/users', getUser);
...
```

---

##### Using Bookshelf Methods seamlessly

```js
var pm = require('bookshelf-pagemaker')(bookshelf);

var User = bookshelf.Model.extend({
    tableName: 'users'
});

pm(User).forge()
.limit(2)
.page(2)
.query(function(qb) {
    qb.where('name', 'LIKE', '%john%');
})
.paginate()
.end()
.then(function(results) {
	console.log(JSON.stringify(results, null, '  '));
});

```

---

##### Using transactions

```js
var pm = require('bookshelf-pagemaker')(bookshelf);

var User = bookshelf.Model.extend({
    tableName: 'users'
});

bookshelf.transaction(function(t) {
    return pm(User).forge()
    .query(function(qb) {
        qb.where('name', 'LIKE', '%john%');
    })
    .paginate({ transacting: t })
    .end();
})
.then(function(results) {
	console.log(JSON.stringify(results, null, '  '));
});

```

## Tools
---

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.