/*jshint esversion: 6 */

/**
 * Primary file for the API
 */

// 2. Dependencies - Module System
const http = require('http'),
      https = require('https'),
      url = require('url'), // Parse and query) URLs
      StringDecoder = require('string_decoder').StringDecoder,
      fs = require('fs'),
      _config = require('./lib/config'),
      _data = require('./lib/data'),
      _handlers = require('./lib/handlers'),
      _helpers = require('./lib/helpers');

// TESTING
// @TODO Delete this test
// _data.delete('test','newFile', (err) => {
    // console.log('The data is: ', data);
    // console.log('The error is: ', err);
// });

// 2. The HTTP server should respond to all request with a string
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});
// 3. Start the server
httpServer.listen(_config.httpPort, () => console.log(`Listening on port http://localhost:${_config.httpPort} in ${_config.envName} mode`));

// 11. The HTTPS server should respond to all request with a string
const httpsOptionServer = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsOptionServer, (req, res) => {
    unifiedServer(req, res);
});
// 11. Start the server
httpsServer.listen(_config.httpsPort, () => console.log(`Listening on port http://localhost:${_config.httpsPort} in ${_config.envName} mode`));

const unifiedServer = (req, res) => {
    // 4. Get URL and parse it
    const parsedURL = url.parse(req.url, true);
    // console.log(parsedURL);

    // 4. Get the path and remove slashes
    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // 6. Get the query string as an object
    const queryStringObject = parsedURL.query;

    // 5. Get the HTTP method
    const method = req.method.toLowerCase();

    // 7. Get the headers as an object
    const headers = req.headers;

    // 8. Get the PAYLOAD if any - Payload === Stream
    const decoder = new StringDecoder('utf-8'); // decoder Bits
    let buffer = '';
    req.on('data', data => {
        buffer += decoder.write(data); // Event data, append the parsed payload
    });
    req.on('end', () => {
        buffer += decoder.end(); // Ends whatever the payload

        // 8. Choose handler req || not found
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
            router[trimmedPath] : _handlers.notFound;

        // 8. Create a data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            'payload': _helpers.parseJsonToObject(buffer)
        };

        // 9. Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handler. or default 200
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
            // Use the payload calledBack by the handler, or default empty object
            payload = typeof(payload) === 'object' ? payload : {};
            // Parse payload to a string
            const payloadString = JSON.stringify(payload);
            // 9. Return response 10. Returning JSON
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning this response: ', statusCode, payloadString); // 9. -
        });
    
        // Send the response
        // res.end('Hello Node!\n');
    
        // 3. Log the request
        // console.log('Request path is: ', trimmedPath); // 4. -
        // console.log('Request method is: ', method); // 5. -
        // console.log('Request query is: ', queryStringObject); // 6. -
        // console.log('Request headers are: ', headers); // 7. -
        // console.log('Request have this payload: ', buffer); // 8. -
    });
};

// 9. Define a request routes
const router = {
    'ping': _handlers.ping,
    'users': _handlers.users
};
