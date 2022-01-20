/* jshint esnext:true */
/**
 * Helpers for various tasks
 * 
 * 
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

// Container for all helpers
const helpers = {};

// Validate strings from Payload
helpers.validatePhone = (str) => {
    const validatedPhone = typeof(str) === 'string' && str.trim().length === 10 ? str.trim() : false;
    return validatedPhone;
};

// Validate strings from Payload
helpers.validateString = (str) => {
    const validatedString = typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : false;
    return validatedString;
};

// Validate booleans from Payload
helpers.validateBoolean = (bool) => {
    const validatedBoolean = typeof(bool) === 'boolean' && bool === true ? true : false;
    return validatedBoolean;
};

// Validate strings from Payload
helpers.validateId = (str) => {
    const validatedId = typeof(str) === 'string' && str.trim().length === 20 ? str.trim() : false;
    return validatedId;
};

// Create a SHA256 hash
helpers.hash = str => {
    // Validate string
    if (helpers.validateString(str)) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse JSON to Object
helpers.parseJsonToObject = (str) => {
    // Validate the Payload
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {};
    }
};

// Create a string with random alphabetic characters, of given length
helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // Define all possible character
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        // Build string
        let str = '';
        for (let i = 1; i <= strLength; i++) {
            // Get random char from possibleCharacters
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append character to the final string
            str += randomCharacter;
        }
        return str;
    } else {
        return false;
    }
};

// Export the module
module.exports = helpers;
