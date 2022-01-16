# RESTful API

## Backend Specs

1. The API listens on a PORT and accepts incoming HTTP requests for POST, GET, PUT, DELETE and HEAD.
2. The API allows a client to connect, then create a new user, then edit and delete that user.
3. The API allows a user to Sign In which gives them a token that they can use for subsequent authenticated requests.
4. The API allows the user to Sign out which invalidates their token.
5. The API allows a signed-in user to use their token to create a new 'check'(feature).
6. The API allows a signed-in user to CRUD checks.
7. In the background, workers perform all the 'checks' at the appropriate times, and send alerts to the users when a check changes its state from Up to Down, or vice versa.

Create file:
type null > index.js
Create folder:
mkdir folderName

## Starting a HTTP server

Require http module
Create server
Send response
Listen server on port

-----

Require url module
Get URL and parse it
Get the path

```javascript
const path = parsedURL.pathname;
var trimmedPath = path.replace(/^\/+|\/+$/g, '');
```

Send the response
Log the request

-----

Figure which HTTP method clients request

```javascript
const method = req.method.toLocaleLowerCase();
```

Get the query string as an object

```javascript
const queryStringObject = parsedURL.query;
```

Get the headers as an object

```javascript
const headers = req.headers;
```

Parsing Payloads

```javascript
    const decoder = new StringDecoder('utf-8'); // decoder Bits
    let buffer = '';
    req.on('data', data => {
        buffer += decoder.write(data); // Event data, append the parsed payload
    });
    req.on('end', () => {
        buffer += decoder.end(); // Ends whatever the payload    
        // Send the response
        res.end('Hello Node!\n');
        console.log('Request have this payload: ', buffer);
    });
```

Set up a Router
Depends in the client request path
/Foo => foo handlers

```javascript
const handlers = {};

handlers.sample = (data, callback) => {
  callback(406, {'name':'sample handler'});
};
handlers.notFound = (data, callback) => {
  callback(404);
};

const router = {
    'sample': handlers.sample
};
```

Create Environments configuration file

```javascript
const environments = {};

environments.staging = { 'port': 3000, 'envName': 'staging' };
environments.production = { 'port': 5000, 'envName': 'production' };

const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

const envToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = envToExport;
```

Update the NODE_ENV variable on Windows

```cmd
SET NODE_ENV=production
```

## HTTPS support

Create SSL certificated.

Download -> [OpenSSL](https://slproweb.com/products/Win32OpenSSL.html)
Install and update environment variable path
Create a HTTPS folder and create Certificate
Complete metadata
Update the config file for each port (http / https)
Create a unified Server for each protocol
