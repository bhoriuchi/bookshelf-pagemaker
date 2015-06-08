

# bookshelf-pagemaker

## Install

```bash
npm install -g bookshelf-pagemaker
```

## Examples

Simply require the module and call the appropriate pagination function passing the parameters and the model.
Request parameters need to be in the form of an Array of Objects. Using qs is the easiest way to accomplish this.
The included example uses restify which uses qs.

```js
var pagemaker = require('bookshelf-pagemaker')(bookshelf);

pagemaker.datatables.paginate(requestParams, YourBookshelfModel).then(function(result) {

    // call a processing function and pass the result 
    someFunction(result);
	
});

```


## Usage


```js
var pagemaker = require('bookshelf-pagemaker')(bookshelf);
```


### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
