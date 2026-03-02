const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImNvbXBhbnlJZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcyNDMwMjU3LCJleHAiOjE3NzI1MTY2NTd9.jxwhCKUwHXdhBdZaOorgGtF5jNC3v33v54f0kKf7yok'; // PASTE YOUR TOKEN HERE

const employeeData = JSON.stringify({
    first_name: 'Temp',
    last_name: 'User',
    email: 'temp.user@pharma.com',
    phone: '555-999-9999',
    position: 'Temporary Employee',
    department: 'Temp Department',
    hire_date: '2024-03-02',
    salary: 50000,
    status: 'active'
});

console.log('📤 CREATING TEMPORARY EMPLOYEE...');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(employeeData)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const response = JSON.parse(data);
        console.log('✅ Created temp employee with ID:', response.employee.id);
        console.log('Now run test-delete-employee.js with this ID!');
    });
});

req.write(employeeData);
req.end();