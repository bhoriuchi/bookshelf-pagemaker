// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: Status codes that mirror HTTP status codes
//

module.exports = {
	OK: {code: 200, message: 'OK'},
	CREATED: {code: 201, message: 'Created'},
	NO_CONTENT: {code: 204, message: 'No Content'},
	NOT_MODIFIED: {code: 304, message: 'Not Modified'},
	BAD_REQUEST: {code: 400, message: 'Bad Request'},
	UNAUTHORIZED: {code: 401, message: 'Unauthorized'},
	FORBIDDEN: {code: 403, message: 'Forbidden'},
	NOT_FOUND: {code: 404, message: 'Not Found'},
	METHOD_NOT_ALLOWED: {code: 405, message: 'Method Not Allowed'},
	NOT_ACCEPTABLE: {code: 406, message: 'Not Acceptable'},
	CONFLICT: {code: 409, message: 'Conflict'},
	INTERNAL_SERVER_ERROR: {code: 500, message: 'Internal Server Error'},
	SQL_ERROR: {code: 1500, message: 'SQL Error'}
};