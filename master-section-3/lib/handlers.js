// jshint esnext: true

// Dependencies
const _data = require('./data'),
      _helpers = require('./helpers');

// handler container
const handlers = {};

// Users
handlers.users = (data, callback) => {
    const acceptableMethods = [ 'post', 'get', 'put', 'delete' ];

    if (acceptableMethods.indexOf(data.method) > -1) handlers._users[data.method](data, callback);
    else callback(405);
};

// Users method containers
// Require data: user Object - no optional
handlers._users = {};
// POST
handlers._users.post = (data, callback) => {
    // Check all data required has typeof and length+ else false
    const firstName = typeof(data.payload.firstName.trim()) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName.trim()) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone.trim()) === 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password.trim()) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Check if user already exists
        _data.read('users', phone, (err, data) => {
            if (!err) {
                // Hash password
                const passwordHashed = _helpers.hash(password);
                if (passwordHashed) {
                    // Create user object
                    const userObject = {
                        firstName, lastName, phone, passwordHashed,
                        'tosAgreement': true
                    };
                    // Persist user data on disc
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error': 'Could not create the new user'});
                        }
                    });
                } else {
                    callback(500, {'Error': 'Could not hashed the password'});
                }
            } else {
                // User already exists
                callback(400, {'Error': 'User already exists'});
            }
        });
    } else {
        // Error on required fields
        callback(400, {'Error': 'One or more fields are required'});
    }
};

// Ping
handlers.ping = (data, callback) => {
    callback(200);
};

// Not Found
handlers.notFound = (data, callback) => {
    callback(404, { 'message': 'Page not found' });
};

// Export handlers module
module.exports = handlers;