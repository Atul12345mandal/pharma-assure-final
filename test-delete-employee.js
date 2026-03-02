const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImNvbXBhbnlJZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcyNDMwMjU3LCJleHAiOjE3NzI1MTY2NTd9.jxwhCKUwHXdhBdZaOorgGtF5jNC3v33v54f0kKf7yok'; // PASTE YOUR TOKEN HERE
const employeeId = 4; // CHANGE THIS TO THE TEMP EMPLOYEE ID

console.log(`📤 DELETING EMPLOYEE ID: ${employeeId}...`);
console.log('========================================');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/employees/${employeeId}`,
    method: 'DELETE',
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
                console.log('✅ DELETE SUCCESSFUL!');
                console.log('   Employee ID', employeeId, 'has been deactivated');
                
                // Now let's verify by trying to get the deleted employee
                console.log('\n🔍 Verifying deletion...');
                const verifyOptions = {
                    hostname: 'localhost',
                    port: 5000,
                    path: `/api/employees/${employeeId}`,
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                };
                
                const verifyReq = http.request(verifyOptions, (verifyRes) => {
                    let verifyData = '';
                    verifyRes.on('data', chunk => verifyData += chunk);
                    verifyRes.on('end', () => {
                        const verifyJson = JSON.parse(verifyData);
                        if (!verifyJson.success) {
                            console.log('✅ Verified: Employee not found (good!)');
                        } else {
                            console.log('⚠️ Employee still exists with status:', verifyJson.employee.status);
                        }
                    });
                });
                verifyReq.end();
                
            } else {
                console.log('❌ Delete failed:', jsonResponse.message);
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