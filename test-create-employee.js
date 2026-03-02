const http = require('http');

const postData = JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@pharma.com',
    phone: '555-123-4567',
    position: 'Software Engineer',
    department: 'Engineering',
    hire_date: '2024-01-15',
    salary: 75000
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees',
    method: 'POST',
    headers: {
        'Authorization': ' eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImNvbXBhbnlJZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcyNDI5NDA0LCJleHAiOjE3NzI1MTU4MDR9.9Xxmk7cFI0cy2IQgxAB5_kp4G7cZRNlpF3wykQuGmqc', // REPLACE THIS!
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('📤 Creating employee...');

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
            console.log('✅ Employee created:', jsonResponse);
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