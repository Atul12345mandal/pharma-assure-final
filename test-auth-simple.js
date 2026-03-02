// Super simple test
const fetch = (await import('node-fetch')).default;

const API = 'http://localhost:5000/api';

async function test() {
    try {
        // Test if API is reachable
        console.log('Testing API connection...');
        const baseRes = await fetch('http://localhost:5000');
        const baseText = await baseRes.text();
        console.log('Base response:', baseText);
        
        // Test signup
        console.log('\nTesting signup...');
        const signupRes = await fetch(`${API}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        const signupData = await signupRes.json();
        console.log('Signup response:', signupData);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();