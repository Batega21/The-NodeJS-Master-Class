/* jshint esnext:true */
/**
 * Request handlers
 */

// Dependencies
const _data = require('./data');
const _helpers = require('./helpers');

// 9. Define handlers
const handlers = {};

// Users Handlers
handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1)
        handlers._users[data.method](data, callback);
    else callback(405);
};

// Users method Container
// Require data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users = {};
// Users - post
handlers._users.post = (data, callback) => {
    // Check all data is required
    // Check if the data payload value is a string and its length is greater thant zero, else return false
    const firstName = _helpers.validateString(data.payload.firstName);
    const lastName = _helpers.validateString(data.payload.lastName);
    const phone = _helpers.validateString(data.payload.phone);
    const password = _helpers.validateString(data.payload.password);
    const tosAgreement = _helpers.validateBoolean(data.payload.tosAgreement);

    if (firstName && lastName && phone && password && tosAgreement) {
        // Check user exist
        _data.read('users', phone, (err, data) => {
            if (!err) {
                // Hash password
                const hashedPass = _helpers.hash(password);

                if (hashedPass) {
                    // Create a new user object
                    const userObject = {
                        firstName,
                        lastName,
                        phone,
                        hashedPass,
                        'tosAgreement': true
                    };
                    // Persist user on disc
                    _data.create('users', phone, userObject, function(err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error': 'Could not create the new user'});
                        }
                    });
                } else {
                    callback(500, {'Error': 'Could not hash user\'s password'});
                }
            } else {
                // User already exists
                callback(400, {'Error': 'That user already exists'});
            }
        });
    } else {
        callback(400, {'Error': 'One or more fields are required'});
    }
};
// Users - get
// Required data: phone
// Optional data: none
// @TODO Access only to the authenticated users
handlers._users.get = (data, callback) => {
    // Check number is valid
    const phone = _helpers.validatePhone(data.queryStringObject.phone);
    if (phone) {
        // Find user
        _data.read('users', phone, (err, callback) => {
            if (!err && data) {
                // Remove hashed Password before return it
                delete data.hashedPass;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field', 'data': phone});
    }
};
// Users - put
handlers._users.put = (data, callback) => {
    // Check all data is required
};
// Users - delete
handlers._users.delete = (data, callback) => {
    // Check all data is required
};

// Sample handler
handlers.ping = (data, callback) => {
  // Call http status code and payload object
  callback(200);
};
// Not Found handler - not define on router, should handle when not match
handlers.notFound = (data, callback) => {
  // Call http status code
  callback(404, { 'message': 'Sorry page not found, try another url' });
};

module.exports = handlers;