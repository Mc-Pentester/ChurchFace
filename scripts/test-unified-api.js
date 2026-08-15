const http = require('http');

const testData = {
  type: 'INDIVIDUAL',
  title: 'Test prière unifiée',
  content: 'Ceci est un test de l\'API unifiée',
  category: 'SANTE',
  isUrgent: false
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/prayers-unified',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(postData);
req.end();
