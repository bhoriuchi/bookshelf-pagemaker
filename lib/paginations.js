// pagination configurations


// default pagination scheme
var pagemaker = {
		"style": {
			"type": "page"
		},
		"data": {
			"show": true,
			"field": "results"
		},
		"pageSize": {
			"show": false,
			"field": "length",
			"defaultValue": 10,
			"maximum": 1000,
			"param": "length"
		},
		"offset": {
			"show": false,
			"field": "start",
			"defaultValue": 0,
			"param": "start"
		},
		"page": {
			"show": true,
			"field": "currentPage",
			"defaultValue": 1,
			"param": "page"
		},
		"pageCount": {
			"show": true,
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



// pagenation scheme for jQuery datatables
var datatables = {
		"style": {
			"type": "offset"
		},
		"data": {
			"show": true,
			"field": "data"
		},
		"pageSize": {
			"show": false,
			"field": "length",
			"defaultValue": 10,
			"maximum": 1000,
			"param": "length"
		},
		"offset": {
			"show": false,
			"field": "start",
			"defaultValue": 0,
			"param": "start"
		},
		"page": {
			"show": false,
			"field": "page",
			"defaultValue": 1,
			"param": "page"
		},
		"pageCount": {
			"show": false,
			"field": "pagesTotal"
		},
		"count": {
			"show": true,
			"field": "recordsTotal"
		},
		"filteredCount": {
			"show": true,
			"field": "recordsFiltered"
		},
		"previous": {
			"show": false,
			"field": "previous"
		},
		"next": {
			"show": false,
			"field": "next"
		},
		"search": {
			"enabled": true,
			"param": "search",
			"regexParam": "regex",
			"complex": true
		},
		"order": {
			"enabled": true,
			"param": "order",
			"defaultDirection": "asc",
			"complex": true
		},
		"complex": {
			"enabled": true,
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
		},
		"passthrough": [ { "param": "draw", "type": "integer", "field": "draw" } ]
};



module.exports = {
	pagemaker: pagemaker,
	datatables: datatables
};
