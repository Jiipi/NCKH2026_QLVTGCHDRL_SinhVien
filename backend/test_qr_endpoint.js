const http = require('http');

// Test QR endpoint
const activityId = '9aa5ddb9-0f68-465c-b537-0bd583e05b21';
const token = 'YOUR_TOKEN_HERE'; // Replace with actual token from browser

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/core/activities/${activityId}/qr-data`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const json = JSON.parse(data);
      console.log('Parsed:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Not JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
