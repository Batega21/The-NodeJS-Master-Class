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
            // Validate that user with phone number that does not exists on READ, if not return error
            if (err) {
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
                callback(400, {'Error': 'A user with that phone number already exists'});
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
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                // Remove hashed Password before return it
                delete data.hashedPass;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};
// Users - put
// Require data: phone
// Optional data: firstName, lastName, password
// @TODO Access only to the authenticated users
handlers._users.put = (data, callback) => {
    // Check phone data required
    const phone = _helpers.validatePhone(data.payload.phone);
    // Check all optional data
    const firstName = _helpers.validateString(data.payload.firstName);
    const lastName = _helpers.validateString(data.payload.lastName);
    const password = _helpers.validateString(data.payload.password);

    if (phone) {
        // Check if there is one optional data was sent
        if (firstName || lastName || password) {
            // Find user
            _data.read('users', phone, (err, userData) => {
                if (!err && userData) {
                    // Update the fields to update
                    if (firstName) userData.firstName = firstName;
                    if (lastName) userData.lastName = lastName;
                    if (password) userData.password = _helpers.hash(password);

                    // Persist updated data on disc
                    _data.update('users', phone, userData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not update the user' });
                        }
                    });
                } else {
                    callback(400, {'Error':'The specified user does not exist' });
                }
            });
        } else {
            callback(400, { 'Error': 'Missing fields to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required phone field' });        
    }
};
// Users - delete
// Require field: phone
// @TODO Access to authenticated users
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
    // Check number is valid
    const phone = _helpers.validatePhone(data.queryStringObject.phone);
    if (phone) {
        // Find user
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                _data.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error': 'Could not delete the specified user' });
                    }
                });
            } else {
                callback(404, {'Error': 'Could not find the specified user'});
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};

// Tokens Handlers
handlers.tokens = (data, callback) => {
    const acceptableMethods = [ 'post', 'get', 'put', 'delete' ];
    if (acceptableMethods.indexOf(data.method) > -1)
        handlers._tokens[data.method](data, callback);
    else callback(405);
};

// Tokens sub method containers
handlers._tokens = {};

// Tokens - POST
// Require data: phone & password
// Optional data: none
handlers._tokens.post = (data, callback) => {
    // Sub method handler for POST
    const phone = _helpers.validateString(data.payload.phone);
    const password = _helpers.validateString(data.payload.password);
    
    if (phone && password) {
        // Find user with phone KEY
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                // Hash password and compare with the persistence
                const hashedPass = _helpers.hash(password);

                if (hashedPass === userData.hashedPass) {
                    // Create a new token with random name with expiration date of one hour
                    const tokenId = _helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    // Create token Object
                    const tokenObj = {
                        phone,
                        'id': tokenId,
                        expires
                    };
                    // Persist token in disc
                    _data.create('tokens', tokenId, tokenObj, (err) => {
                        if (!err) {
                            callback(200, tokenObj);
                        } else {
                            callback(500, { 'Error': 'Could not create token' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Password did not match' });
                }
            } else {
                callback(400, { 'Error': 'Could not find user' });                
            }
        });
    } else {
        callback(400, { 'Error': 'Missing phone or password fields' });
    }
};

// Tokens - GET
// Require data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
    // Check ID valid
    // Check number is valid
    const id = _helpers.validateId(data.queryStringObject.id);
    if (id) {
        // Find token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};

// Tokens - PUT
// Require data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
    
    const id = _helpers.validateId(data.payload.id);
    const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;
    if (id && extend) {
        // Find token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check if token is expired
                if (tokenData.expires > Date.now()) {
                    // Update token expire date
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // Persist new token in disc
                    _date.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, { 'Error': 'Could not update token\'s expiration' });                            
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Token is expired' });
                }
            } else {
                callback(400, { 'Error': 'Token does not exists' });
            }
        });
    } else {
        callback(400,{ 'Error' : 'Missing fields or fields invalid' });
    }
};

// Tokens - DELETE
handlers._tokens.delete = (data, callback) => {
    // Sub method handler for DELETE
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