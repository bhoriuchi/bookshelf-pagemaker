// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: methods
//

module.exports = {
	RESOURCE_REFERENCED: {
		code: 'ER_RESOURCE_REFERENCED',
		detail: 'The resource is still being referenced by another, use the {force: true} option to attempt reference removal'
	},
	UNIQUE_FIELD_VIOLATION: {
		code: 'ER_UNIQUE_FIELD_VIOLATION',
		detail: 'The request contained a value that violates a unique constraint'
	},
	BAD_REQUEST_BODY: {
		code: 'ER_BAD_REQUEST_BODY',
		detail: 'The request body contained invalid or incomplete data'
	},
	INVALID_ID: {
		code: 'ER_INVALID_ID',
		detail: 'The request did not supply a valid ID'
	},
	NOT_FOUND: {
		code: 'ER_RESOURCE_NOT_FOUND',
		detail: 'The requested resource could not be found'
	}
};