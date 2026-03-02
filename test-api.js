// Use built-in http module instead of fetch (no installation needed)
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

// Test Signup
console.log('Testing Signup...');
const signupReq = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Signup Response:', JSON.parse(data));
        
        // Now test Login
        testLogin();
    });
});

signupReq.write(JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
}));
signupReq.end();

function testLogin() {
    console.log('\nTesting Login...');
    const loginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const loginReq = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const response = JSON.parse(data);
            console.log('Login Response:', response);
            
            if (response.token) {
                testProtectedRoute(response.token);
            }
        });
    });
    
    loginReq.write(JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
    }));
    loginReq.end();
}

function testProtectedRoute(token) {
    console.log('\nTesting Protected Route...');
    const protectedOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/compliance',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    
    const protectedReq = http.request(protectedOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Protected Route Response:', data);
        });
    });
    protectedReq.end();
}