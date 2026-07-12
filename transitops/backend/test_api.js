const http = require('http');

const data = JSON.stringify({
    email: 'dispatcher@transitops.com',
    password: 'dispatch123',
    role: 'Dispatcher'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => console.log(`Status: ${res.statusCode}\nResponse: ${responseBody}`));
});

req.on('error', (e) => console.error(`Problem with request: ${e.message}`));
req.write(data);
req.end();
