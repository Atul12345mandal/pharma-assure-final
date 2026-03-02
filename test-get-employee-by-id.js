const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImNvbXBhbnlJZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcyNDMwMjU3LCJleHAiOjE3NzI1MTY2NTd9.jxwhCKUwHXdhBdZaOorgGtF5jNC3v33v54f0kKf7yok'; // PASTE YOUR TOKEN HERE
const employeeId = 3; // John Doe's ID

console.log(`📤 FETCHING EMPLOYEE ID: ${employeeId}...`);
console.log('========================================');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/employees/${employeeId}`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`📥 Status Code: ${res.statusCode}`);
    console.log('========================================');
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('📥 RESPONSE:');
        console.log(data);
        console.log('========================================');
        
        try {
            const jsonResponse = JSON.parse(data);
            if (jsonResponse.success) {
                console.log('✅ EMPLOYEE FOUND:');
                console.log(`   ID: ${jsonResponse.employee.id}`);
                console.log(`   Name: ${jsonResponse.employee.first_name} ${jsonResponse.employee.last_name}`);
                console.log(`   Email: ${jsonResponse.employee.email}`);
                console.log(`   Position: ${jsonResponse.employee.position}`);
                console.log(`   Department: ${jsonResponse.employee.department}`);
                console.log(`   Status: ${jsonResponse.employee.status}`);
            } else {
                console.log('❌ Employee not found');
            }
        } catch (e) {
            console.log('❌ Could not parse response');
        }
        console.log('========================================');
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.end();