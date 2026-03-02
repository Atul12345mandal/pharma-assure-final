const { Pool } = require('pg');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "pharmacomply360",
    password: "",
    port: 5432,
});

async function test() {
    try {
        console.log('🔍 Testing direct database connection...');
        
        // Test 1: Check current database
        const dbResult = await pool.query('SELECT current_database()');
        console.log('✅ Connected to:', dbResult.rows[0].current_database);
        
        // Test 2: Check if employees table exists
        const tableResult = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'employees'
            )`);
        console.log('📋 Employees table exists:', tableResult.rows[0].exists);
        
        // Test 3: Try to insert directly
        if (tableResult.rows[0].exists) {
            console.log('📝 Attempting direct insert...');
            const insertResult = await pool.query(`
                INSERT INTO employees (company_id, first_name, last_name, email)
                VALUES (1, 'Direct', 'Test', 'direct@test.com')
                RETURNING id
            `);
            console.log('✅ Direct insert successful! ID:', insertResult.rows[0].id);
            
            // Test 4: Read back
            const readResult = await pool.query('SELECT * FROM employees');
            console.log('📊 All employees:', readResult.rows);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

test();