/* jshint esnext:true */
/**
 * Request handlers
 */

// Dependencies
const _data = require("./data");
const _helpers = require("./helpers");

// 9. Define handlers
const handlers = {};

// Users Handlers
handlers.users = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];

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
    _data.read("users", phone, (err, data) => {
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
            tosAgreement: true,
          };
          // Persist user on disc
          _data.create("users", phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: "Could not create the new user" });
            }
          });
        } else {
          callback(500, { Error: "Could not hash user's password" });
        }
      } else {
        // User already exists
        callback(400, {
          Error: "A user with that phone number already exists",
        });
      }
    });
  } else {
    callback(400, { Error: "One or more fields are required" });
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
    // Get token from the headers
    const token = _helpers.validateString(data.headers.token);
    // Verify that token is valid for phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Find user
        _data.read("users", phone, (err, data) => {
          if (!err && data) {
            // Remove hashed Password before return it
            delete data.hashedPass;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
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
      // Get token from the headers
      const token = _helpers.validateString(data.headers.token);
      // Verify that token is valid for phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // Find user
          _data.read("users", phone, (err, userData) => {
            if (!err && userData) {
              // Update the fields to update
              if (firstName) userData.firstName = firstName;
              if (lastName) userData.lastName = lastName;
              if (password) userData.password = _helpers.hash(password);

              // Persist updated data on disc
              _data.update("users", phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: "Could not update the user" });
                }
              });
            } else {
              callback(400, { Error: "The specified user does not exist" });
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in header, or token is invalid",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required phone field" });
  }
};
// Users - delete
// Require field: phone
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
  // Check number is valid
  const phone = _helpers.validatePhone(data.queryStringObject.phone);
  if (phone) {
    // Get token from the headers
    const token = _helpers.validateString(data.headers.token);
    // Verify that token is valid for phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Find user
        _data.read("users", phone, (err, data) => {
          if (!err && data) {
            _data.delete("users", phone, (err) => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { Error: "Could not delete the specified user" });
              }
            });
          } else {
            callback(404, { Error: "Could not find the specified user" });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Tokens Handlers
handlers.tokens = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
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
    _data.read("users", phone, (err, userData) => {
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
            id: tokenId,
            expires,
          };
          // Persist token in disc
          _data.create("tokens", tokenId, tokenObj, (err) => {
            if (!err) {
              callback(200, tokenObj);
            } else {
              callback(500, { Error: "Could not create token" });
            }
          });
        } else {
          callback(400, { Error: "Password did not match" });
        }
      } else {
        callback(400, { Error: "Could not find user" });
      }
    });
  } else {
    callback(400, { Error: "Missing phone or password fields" });
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
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Tokens - PUT
// Require data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  const id = _helpers.validateId(data.payload.id);
  const extend =
    typeof data.payload.extend === "boolean" && data.payload.extend === true
      ? true
      : false;
  if (id && extend) {
    // Find token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check if token is expired
        if (tokenData.expires > Date.now()) {
          // Update token expire date
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Persist new token in disc
          _data.update("tokens", id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: "Could not update token's expiration" });
            }
          });
        } else {
          callback(400, { Error: "Token is expired" });
        }
      } else {
        callback(400, { Error: "Token does not exists" });
      }
    });
  } else {
    callback(400, { Error: "Missing fields or fields invalid" });
  }
};

// Tokens - DELETE
// Require data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  // Check ID is valid
  const id = _helpers.validateId(data.queryStringObject.id);
  if (id) {
    // Find user
    _data.read("tokens", id, (err, data) => {
      if (!err && data) {
        _data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete the specified token" });
          }
        });
      } else {
        callback(404, { Error: "Could not find the specified token" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Verify if given token ID is valid for given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Check if token exist
  _data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check if token match for valid user
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Checks
handlers.checks = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the checks methods
handlers._checks = {};

// Checks - post
// Required data: protocol,url,method,successCodes,timeoutSeconds
// Optional data: none
handlers._checks.post = function (data, callback) {
  // Validate inputs
  var protocol =
    typeof data.payload.protocol == "string" &&
    ["https", "http"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  var url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  var method =
    typeof data.payload.method == "string" &&
    ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  var successCodes =
    typeof data.payload.successCodes == "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  var timeoutSeconds =
    typeof data.payload.timeoutSeconds == "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;
  if (protocol && url && method && successCodes && timeoutSeconds) {
    // Get token from headers
    var token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // Lookup the user phone by reading the token
    _data.read("tokens", token, function (err, tokenData) {
      if (!err && tokenData) {
        var userPhone = tokenData.phone;

        // Lookup the user data
        _data.read("users", userPhone, function (err, userData) {
          if (!err && userData) {
            var userChecks =
              typeof userData.checks == "object" &&
              userData.checks instanceof Array
                ? userData.checks
                : [];
            // Verify that user has less than the number of max-checks per user
            if (userChecks.length < config.maxChecks) {
              // Create random id for check
              var checkId = helpers.createRandomString(20);

              // Create check object including userPhone
              var checkObject = {
                id: checkId,
                userPhone: userPhone,
                protocol: protocol,
                url: url,
                method: method,
                successCodes: successCodes,
                timeoutSeconds: timeoutSeconds,
              };

              // Save the object
              _data.create("checks", checkId, checkObject, function (err) {
                if (!err) {
                  // Add check id to the user's object
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // Save the new user data
                  _data.update("users", userPhone, userData, function (err) {
                    if (!err) {
                      // Return the data about the new check
                      callback(200, checkObject);
                    } else {
                      callback(500, {
                        Error: "Could not update the user with the new check.",
                      });
                    }
                  });
                } else {
                  callback(500, { Error: "Could not create the new check" });
                }
              });
            } else {
              callback(400, {
                Error:
                  "The user already has the maximum number of checks (" +
                  config.maxChecks +
                  ").",
              });
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400, { Error: "Missing required inputs, or inputs are invalid" });
  }
};

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = function (data, callback) {
  // Check that id is valid
  var id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the check
    _data.read("checks", id, function (err, checkData) {
      if (!err && checkData) {
        // Get the token that sent the request
        var token =
          typeof data.headers.token == "string" ? data.headers.token : false;
        // Verify that the given token is valid and belongs to the user who created the check
        handlers._tokens.verifyToken(
          token,
          checkData.userPhone,
          function (tokenIsValid) {
            if (tokenIsValid) {
              // Return check data
              callback(200, checkData);
            } else {
              callback(403);
            }
          }
        );
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required field, or field invalid" });
  }
};

// Checks - put
// Required data: id
// Optional data: protocol,url,method,successCodes,timeoutSeconds (one must be sent)
handlers._checks.put = function (data, callback) {
  // Check for required field
  var id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;

  // Check for optional fields
  var protocol =
    typeof data.payload.protocol == "string" &&
    ["https", "http"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  var url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  var method =
    typeof data.payload.method == "string" &&
    ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  var successCodes =
    typeof data.payload.successCodes == "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  var timeoutSeconds =
    typeof data.payload.timeoutSeconds == "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  // Error if id is invalid
  if (id) {
    // Error if nothing is sent to update
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // Lookup the check
      _data.read("checks", id, function (err, checkData) {
        if (!err && checkData) {
          // Get the token that sent the request
          var token =
            typeof data.headers.token == "string" ? data.headers.token : false;
          // Verify that the given token is valid and belongs to the user who created the check
          handlers._tokens.verifyToken(
            token,
            checkData.userPhone,
            function (tokenIsValid) {
              if (tokenIsValid) {
                // Update check data where necessary
                if (protocol) {
                  checkData.protocol = protocol;
                }
                if (url) {
                  checkData.url = url;
                }
                if (method) {
                  checkData.method = method;
                }
                if (successCodes) {
                  checkData.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkData.timeoutSeconds = timeoutSeconds;
                }
                // Store the new updates
                _data.update("checks", id, checkData, function (err) {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(500, { Error: "Could not update the check." });
                  }
                });
              } else {
                callback(403);
              }
            }
          );
        } else {
          callback(400, { Error: "Check ID did not exist." });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update." });
    }
  } else {
    callback(400, { Error: "Missing required field." });
  }
};

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = function (data, callback) {
  // Check that id is valid
  var id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the check
    _data.read("checks", id, function (err, checkData) {
      if (!err && checkData) {
        // Get the token that sent the request
        var token =
          typeof data.headers.token == "string" ? data.headers.token : false;
        // Verify that the given token is valid and belongs to the user who created the check
        handlers._tokens.verifyToken(
          token,
          checkData.userPhone,
          function (tokenIsValid) {
            if (tokenIsValid) {
              // Delete the check data
              _data.delete("checks", id, function (err) {
                if (!err) {
                  // Lookup the user's object to get all their checks
                  _data.read(
                    "users",
                    checkData.userPhone,
                    function (err, userData) {
                      if (!err) {
                        var userChecks =
                          typeof userData.checks == "object" &&
                          userData.checks instanceof Array
                            ? userData.checks
                            : [];
                        // Remove the deleted check from their list of checks
                        var checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // Re-save the user's data
                          userData.checks = userChecks;
                          _data.update(
                            "users",
                            checkData.userPhone,
                            userData,
                            function (err) {
                              if (!err) {
                                callback(200);
                              } else {
                                callback(500, {
                                  Error: "Could not update the user.",
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            Error:
                              "Could not find the check on the user's object, so could not remove it.",
                          });
                        }
                      } else {
                        callback(500, {
                          Error:
                            "Could not find the user who created the check, so could not remove the check from the list of checks on their user object.",
                        });
                      }
                    }
                  );
                } else {
                  callback(500, { Error: "Could not delete the check data." });
                }
              });
            } else {
              callback(403);
            }
          }
        );
      } else {
        callback(400, { Error: "The check ID specified could not be found" });
      }
    });
  } else {
    callback(400, { Error: "Missing valid id" });
  }
};

// Sample handler
handlers.ping = (data, callback) => {
  // Call http status code and payload object
  callback(200);
};
// Not Found handler - not define on router, should handle when not match
handlers.notFound = (data, callback) => {
  // Call http status code
  callback(404, { message: "Sorry page not found, try another url" });
};

module.exports = handlers;