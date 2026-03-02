const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImNvbXBhbnlJZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcyNDMwMjU3LCJleHAiOjE3NzI1MTY2NTd9.jxwhCKUwHXdhBdZaOorgGtF5jNC3v33v54f0kKf7yok'; // PASTE YOUR TOKEN HERE
const employeeId = 3; // John Doe's ID

const updateData = JSON.stringify({
    position: 'Senior Software Engineer',
    salary: 95000,
    department: 'Engineering',
    status: 'active'
});

console.log(`📤 UPDATING EMPLOYEE ID: ${employeeId}...`);
console.log('📤 Update Data:', JSON.parse(updateData));
console.log('========================================');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/employees/${employeeId}`,
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updateData)
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
                console.log('✅ UPDATE SUCCESSFUL!');
                console.log('   Updated Employee:');
                console.log(`   ID: ${jsonResponse.employee.id}`);
                console.log(`   Name: ${jsonResponse.employee.first_name} ${jsonResponse.employee.last_name}`);
                console.log(`   New Position: ${jsonResponse.employee.position}`);
                console.log(`   New Salary: $${jsonResponse.employee.salary}`);
                console.log(`   Department: ${jsonResponse.employee.department}`);
            } else {
                console.log('❌ Update failed:', jsonResponse.message);
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

req.write(updateData);
req.end();