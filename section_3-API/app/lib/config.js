/*jshint esversion: 6 */

/**
 * Create and export configuration variables
 * 
 * Import NOTE:
 * To run set the NODE_ENV in Windows
 * you need to set it in the command line like this:
 * Set NODE_ENV=envName
 * 
 */

// Container for all the environments
const environments = {};

// Staging *(default) environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret'
};

// Production *(default) environment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsAnotherSecret'
};

// Catch which env was passed as a cmd argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check currentEnvironment exist on environments object
const envToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = envToExport;
