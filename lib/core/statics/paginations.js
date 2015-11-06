// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: standard paginations
//


/*
 * jQuery Datatables Format
 * https://www.datatables.net/manual/server-side
 */
var datatables = {
	usePages: false,
	input: {
		search: {
			param: 'search',
			fields: {
				value: 'value',
				regex: 'regex'
			}
		},
		order: {
			param: 'order',
			defaultDirection: 'asc',
			fields: {
				column: 'column',
				direction: 'dir'
			}
		},
		columns: {
			param: 'columns',
			fields: {
				data: 'data',
				name: 'name',
				searchable: 'searchable',
				orderable: 'orderable'
			}
		}
	},
	fields: {
		start: {
			show: false,
			displayName: 'start',
			param: 'start',
			defaultValue: 0
		},
		length: {
			show: false,
			displayName: 'length',
			param: 'length',
			defaultValue: 10,
			maximum: 50
		},
		recordsTotal: {
			show: true,
			displayName: 'recordsTotal',
			displayOrder: 1
		},
		recordsFiltered: {
			show: true,
			displayName: 'recordsFiltered',
			displayOrder: 2
		},
		data: {
			show: true,
			displayName: 'data',
			displayOrder: 3
		},
		error: {
			show: true,
			displayName: 'error'
		},
		pagesTotal: {
			show: false,
			displayName: 'pagesTotal'
		},
		pagesFiltered: {
			show: false,
			displayName: 'pagesFiltered'
		},
		currentPage: {
			show: false,
			displayName: 'currentPage',
			param: 'page',
			defaultValue: 1
		},
		previous: {
			show: false,
			displayName: 'previous'
		},
		next: {
			show: false,
			displayName: 'next'
		}
	},
	rows: {
		rowId: {
			show: true,
			displayName: 'DT_RowId',
			get: function(model, record) {
				if (model.idAttribute && record.hasOwnProperty(model.idAttribute)) {
					return record[model.idAttribute];
				}
				return null;
			}
		},
		rowClass: {
			show: true,
			displayName: 'DT_RowClass',
			get: function(model, record) {
				if (typeof (model._rowClass) === 'function') {
					return model._rowClass(model, record);
				}
				return null;
			}
		},
		rowData: {
			show: true,
			displayName: 'DT_RowData',
			get: function(model, record) {
				if (typeof (model._rowData) === 'function') {
					return model._rowData(model, record);
				}
				return null;
			}
		},
		rowAttr: {
			show: true,
			displayName: 'DT_RowAttr',
			get: function(model, record) {
				if (typeof (model._rowAttr) === 'function') {
					return model._rowAttr(model, record);
				}
				return null;
			}
		}
	},
	transforms: [
	    {
	    	displayName: 'draw',
	    	displayOrder: 0,
	    	param: 'draw',
	    	transform: function(value) {
	    		return !isNaN(value) ? parseInt(value, 10) : 1;
	    	}
	    }
	],
};


/*
 * Basic Paged Pagination
 */
var paged = {
	usePages: true,
	input: {
		search: {
			param: 'search',
			fields: {
				value: 'value',
				regex: 'regex'
			}
		},
		order: {
			param: 'order',
			defaultDirection: 'asc',
			fields: {
				column: 'column',
				direction: 'dir'
			}
		},
		columns: {
			param: 'columns',
			fields: {
				data: 'data',
				name: 'name',
				searchable: 'searchable',
				orderable: 'orderable'
			}
		}
	},
	fields: {
		start: {
			show: false,
			displayName: 'start',
			param: 'start',
			defaultValue: 0
		},
		length: {
			show: true,
			displayName: 'limit',
			param: 'limit',
			defaultValue: 10,
			maximum: 50,
			displayOrder: 3
		},
		recordsTotal: {
			show: false,
			displayName: 'recordsTotal'
		},
		recordsFiltered: {
			show: false,
			displayName: 'recordsFiltered'
		},
		data: {
			show: true,
			displayName: 'resources',
			displayOrder: 6
		},
		error: {
			show: false,
			displayName: 'error'
		},
		pagesTotal: {
			show: true,
			displayName: 'pagesTotal',
			displayOrder: 4
		},
		pagesFiltered: {
			show: true,
			displayName: 'pagesFiltered',
			displayOrder: 5
		},
		currentPage: {
			show: true,
			displayName: 'current',
			param: 'page',
			defaultValue: 1,
			displayOrder: 1
		},
		previous: {
			show: true,
			displayName: 'previous',
			displayOrder: 0
		},
		next: {
			show: true,
			displayName: 'next',
			displayOrder: 2
		}
	}
};


/*
 * Basic Limit Offset Pagination
 */
var offset = {
	usePages: false,
	input: {
		search: {
			param: 'search',
			fields: {
				value: 'value',
				regex: 'regex'
			}
		},
		order: {
			param: 'order',
			defaultDirection: 'asc',
			fields: {
				column: 'column',
				direction: 'dir'
			}
		},
		columns: {
			param: 'columns',
			fields: {
				data: 'data',
				name: 'name',
				searchable: 'searchable',
				orderable: 'orderable'
			}
		}
	},
	fields: {
		start: {
			show: false,
			displayName: 'offset',
			param: 'offset',
			defaultValue: 0
		},
		length: {
			show: true,
			displayName: 'limit',
			param: 'limit',
			defaultValue: 10,
			maximum: 50,
			displayOrder: 3
		},
		recordsTotal: {
			show: true,
			displayName: 'resourcesTotal',
			displayOrder: 4
		},
		recordsFiltered: {
			show: true,
			displayName: 'resourcesFiltered',
			displayOrder: 5
		},
		data: {
			show: true,
			displayName: 'resources',
			displayOrder: 6
		},
		error: {
			show: false,
			displayName: 'error'
		},
		pagesTotal: {
			show: false,
			displayName: 'pagesTotal'
		},
		pagesFiltered: {
			show: false,
			displayName: 'pagesFiltered'
		},
		currentPage: {
			show: true,
			displayName: 'current',
			param: 'offset',
			defaultValue: 0,
			displayOrder: 1
		},
		previous: {
			show: true,
			displayName: 'previous',
			displayOrder: 0
		},
		next: {
			show: true,
			displayName: 'next',
			displayOrder: 2
		}
	}
};



// export the paginations
module.exports = {
	datatables: datatables,
	paged: paged,
	offset: offset
};