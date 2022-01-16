/*jshint esversion: 8 */

/**
 * mastering RestFUL API
 * 
 */

const http = require('http'),
      url  = require('url'),
      StringDecoder = require('string_decoder').StringDecoder,
      port = 3000;

const server = http.createServer((req, res) => {
    const parsedURL = url.parse(req.url, true),
          path = parsedURL.pathname,
          trimmedPath = path.replace(/^\/+|\/+$/g, ''),
          queryStringObject = parsedURL.query,
          method = req.method.toLowerCase(),
          header = req.headers,
          decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', data => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
        const handlerChosen = typeof(router[trimmedPath]) !== 'undefined' ?
            router[trimmedPath] : handlers.notFound;
        const data = {
            trimmedPath, queryStringObject, method, header,
            'payload' : buffer
        };

        handlerChosen(data, (statusCode, payLoad) => {
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
            payLoad = typeof(payLoad) === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payload);
            console.log(`Res with statusCode ${statusCode} of ${trimmedPath} is: `, payloadString);
        });
    });
});

server.listen(port, () => console.log(`Serving on port http://localhost:${port}`));

const handlers = {};
handlers.sample = (data, callBack) => {
    callBack(406, {'name': 'Sample handler'});
};
handlers.notFound = (data, callBack) => {
    callBack(404);
};

const router = {
    'sample': handlers.sample
};