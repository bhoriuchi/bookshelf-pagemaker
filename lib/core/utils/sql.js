// Author: Branden Horiuchi <bhoriuchi@gmail.com>
// Description: SQL utils
//


module.exports = function(env) {
	
	// constants
	var _JTYP  = env.statics.jsTypes;

	// modules
	var _      = env.lodash;
	var dbType = env.bookshelf.knex.client.config.client;
	var utils  = env.utils;
	var u      = utils.util;
	
	// unique queries or settings that are database specific go here
	// only supported knex databases
	// 
	// Credits:
	// ** epoch time: https://shafiqissani.wordpress.com/2010/09/30/how-to-get-the-current-epoch-time-unix-timestamp/
	// ** epoch time: http://currentmillis.com/
	// ** mysql in miliseconds: http://stackoverflow.com/questions/9624284/current-timestamp-in-milliseconds
	// ** sqlite3 uuid: http://ask.webatall.com/sqlite/11700_is-there-uid-datatype-in-sqlite-if-yes-then-how-to-generate-value-for-that.html
	//
	var specific = {
		mysql: {
			regex: function(compareTo, regex) {
				return compareTo + " REGEXP '" + regex + "' AND ";
			},
			utcSeconds: 'round(unix_timestamp(curtime(4)) * 1000)',
			uuid: 'uuid()',
			tsFormat: 'YYYY-MM:DDTHH:mm:ss z'
		},
		postgres: {
			regex: function(compareTo, regex) {
				return compareTo + " ~ '" + regex + "' AND ";
			},
			utcSeconds: 'round(extract(epoch FROM now()) * 1000)',
			uuid: 'uuid_generate_v1()',
			tsFormat: 'YYYY-MM:DD HH:mm:ss z'
		},
		maria: {
			regex: function(compareTo, regex) {
				return compareTo + " REGEXP '" + regex + "' AND ";
			},
			utcSeconds: 'round(unix_timestamp(curtime(4)) * 1000)',
			uuid: 'uuid()',
			tsFormat: 'YYYY-MM:DD HH:mm:ss z'
		},
		sqlite3: {
			regex: function(compareTo, regex) {
				return compareTo + " REGEXP '" + regex + "' AND ";
			},
			utcSeconds: '(datetime(\'now\', \'unixepoch\') * 1000)',
			uuid: '(SELECT SUBSTR(UUID, 0, 8)||\'-\'||SUBSTR(UUID,8,4)||\'-\'||SUBSTR(UUID,12,4)||\'-\'||SUBSTR(UUID,16) from (select lower(hex(randomblob(16))) AS UUID)',
			tsFormat: 'YYYY-MM:DD HH:mm:ss z'
		},
		oracle: {
			"regex": function(compareTo, regex) {
				return "REGEXP_LIKE(" + compareTo + ",'" + regex + "') AND ";
			},
			utcSeconds: '(SELECT (SYSDATE - TO_DATE(\'01-01-1970 00:00:00\', \'DD-MM-YYYY HH24:MI:SS\')) * 24 * 60 * 60 * 1000 FROM DUAL)',
			uuid: '(select sys_guid() from dual)',
			tsFormat: 'YYYY-MM:DD HH:mm:ss z'
		}
	};
	
	
	// get the specific SQL variables
	function getSpecific() {
		
		// check that there is a type in the database, default to MYSQL
		var type = _.has(specific, dbType) ? dbType : 'mysql';
		return specific[type];
	}

	
	// return public functions
	return {
		getSpecific: getSpecific,
		specific: specific
	};
};