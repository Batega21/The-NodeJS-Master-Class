// jshint esnext: true

// Dependencies
const crypto = require('crypto'),
      config = require('./config');

// Helpers container
const helpers = {};

// SHA256 hash helper
helpers.hash = (str) => {
    // Validate string
    if (typeof(str) === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse JSON to Object helper
helpers.parseJsonToObject = (str) => {
    // Validate the Payload
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {};
    }
};

// Export Helpers module
module.exports = helpers;