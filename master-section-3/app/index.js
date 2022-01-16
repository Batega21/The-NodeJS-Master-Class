// jshint esnext: true

// Dependencies
const http = require('http'),
      https = require('https'),
      url = require('url'),
      StringDecoder = require('string_decoder').StringDecoder,
      config = require('../lib/config'),
      handlers = require('../lib/handlers'),
      helpers = require('../lib/helpers');

// Testing

// HTTP server
const httpServer = http.createServer((req, res) => {
    serversHandlers(req, res);
});

// Start HTTP server
httpServer.listen(config.httpPort, () => console.log(`Server running at port: ${config.httpPort}`));

// HTTPS Key and Server

// HTTPS server
const httpsServer = https.createServer(httpCertOptions, (req, res) => {
    serversHandlers(req, res);
});

// Start HTTPS server
httpServers.listen(config.httpdPort, () => console.log(`Server running at port: ${config.httpsPort}`));

// Handle both server
const serversHandlers = (req, res) => {
    // Parse URL - true parsed queryString
    const parsedURL = url.parse(req.url, true);
    // Get path and remove slashes
    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    // Get queryString
    const queryStringObject = parsedURL.query;
    // Get method
    const method = req.method.toLowerCase();
    // Get Headers
    const headers = req.headers;
    // Get Payload
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
        // Choose handler req
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    });
    // Build data Object to send to the handler
    const data = {
        trimmedPath, queryStringObject, method, headers,
        'payload': helpers.parseJsonToObject(buffer)
    };
    // Route the request to the handler specified in route
    chosenHandler(data, (statusCode, payload) => {
        // Use the statusCode called back by the handler or 300 by Default
        statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
        // Use the payload called back by the handler or empty Object
        payload = typeof(payload) === 'object' ? payload : {};
        // Parse payload to string
        const payloadParsed = JSON.stringify(payload);
        // Return the JSON object response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadParsed);
    });
};

// Routes
const router = {
    'ping': handlers.ping,
    'users': handlers.users
};