// jshint esnext: true

// Environment container
const environments = {};

// Developer (default) environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret'
}

// Production environment
environments.staging = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsAnotherSecret'
}

// Catch which env was passed as a cmd argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check currentEnvironment exists on environment object
const envToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : {};

// Export config Module
module.exports = envToExport;