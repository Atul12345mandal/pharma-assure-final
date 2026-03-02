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
            console.log('✅ Parsed response:', jsonResponse);
            if (jsonResponse.user) {
                console.log('✅ Login successful! User ID:', jsonResponse.user.id);
            }
        } catch (e) {
            console.log('❌ Could not parse as JSON:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.write(postData);
req.end();