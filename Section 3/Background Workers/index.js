/*
 * Primary file for API
 *
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// Declare the app
const app = {};

// Init function
app.init = () => {

  // Start the server
  server.init();

  // Start the workers
  workers.init();

};

// Self executing
app.init();


// Export the app
module.exports = app;
