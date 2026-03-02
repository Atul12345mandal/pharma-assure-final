// For Node.js version 18+ with experimental fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRegister() {
    try {
        console.log('Sending registration request...');
        
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'ceo@pharma.com',
                password: 'password123',
                company_name: 'PharmaCorp International',
                first_name: 'John',
                last_name: 'Smith'
            })
        });
        
        const data = await response.json();
        console.log('✅ Success! Response:', data);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testRegister();