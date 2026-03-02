const http = require('http');

const postData = JSON.stringify({
    email: 'ceo@pharma.com',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('📤 Sending login request...');

const req = http.request(options, (res) => {
    console.log(`📥 Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('📥 Response:', data);
        try {
            const jsonResponse = JSON.parse(data);
            console.log('✅ Login successful!');
            console.log('Token:', jsonResponse.token);
        } catch (e) {
            console.log('❌ Login failed:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.write(postData);
req.end();