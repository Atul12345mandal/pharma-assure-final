const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees',
    method: 'GET',
    headers: {
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImNvbXBhbnlJZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcyNDMwMjU3LCJleHAiOjE3NzI1MTY2NTd9.jxwhCKUwHXdhBdZaOorgGtF5jNC3v33v54f0kKf7yok' // PASTE YOUR TOKEN HERE
    }
};

console.log('📤 FETCHING ALL EMPLOYEES...');
console.log('========================================');

const req = http.request(options, (res) => {
    console.log(`📥 Status Code: ${res.statusCode}`);
    console.log(`📥 Status Message: ${res.statusMessage}`);
    console.log('========================================');
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('📥 RAW RESPONSE:');
        console.log(data);
        console.log('========================================');
        
        try {
            const jsonResponse = JSON.parse(data);
            console.log('✅ PARSED RESPONSE:');
            console.log('Success:', jsonResponse.success);
            console.log('Total Employees:', jsonResponse.count);
            console.log('Employees List:');
            if (jsonResponse.employees && jsonResponse.employees.length > 0) {
                jsonResponse.employees.forEach((emp, index) => {
                    console.log(`\n  ${index + 1}. ID: ${emp.id} - ${emp.first_name} ${emp.last_name}`);
                    console.log(`     Email: ${emp.email}`);
                    console.log(`     Position: ${emp.position}`);
                    console.log(`     Department: ${emp.department}`);
                    console.log(`     Status: ${emp.status}`);
                });
            } else {
                console.log('  No employees found');
            }
        } catch (e) {
            console.log('❌ Could not parse as JSON:', e.message);
        }
        console.log('========================================');
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.end();