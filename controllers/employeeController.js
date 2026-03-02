console.log('✅ employeeController.js loaded');
console.log('📊 Current database:', process.env.DB_NAME || 'pharmacomply360');

const pool = require('../config/database');

// Test database connection on load
pool.query('SELECT current_database(), NOW()', (err, result) => {
    if (err) {
        console.error('❌ Database connection error in employeeController:', err.message);
    } else {
        console.log('✅ Connected to database:', result.rows[0].current_database);
        console.log('🕐 Server time:', result.rows[0].now);
    }
});

// Check if employees table exists
pool.query(`
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'employees'
    )`, (err, result) => {
    if (err) {
        console.error('❌ Error checking employees table:', err.message);
    } else {
        console.log('📋 Employees table exists:', result.rows[0].exists);
        if (!result.rows[0].exists) {
            console.log('⚠️  employees table does NOT exist! Please create it.');
        }
    }
});

// ==========================
// GET ALL EMPLOYEES (for current company)
// ==========================
const getEmployees = async (req, res) => {
    try {
        console.log('🔍 Fetching employees for company:', req.user?.company_id);
        
        const company_id = req.user.company_id; // From auth middleware
        
        const result = await pool.query(
            `SELECT e.*, u.email as user_email, u.role 
             FROM employees e
             LEFT JOIN users u ON e.user_id = u.id
             WHERE e.company_id = $1
             ORDER BY e.created_at DESC`,
            [company_id]
        );
        
        console.log(`✅ Found ${result.rows.length} employees`);
        
        res.json({
            success: true,
            count: result.rows.length,
            employees: result.rows
        });
    } catch (error) {
        console.error('❌ Get employees error:', error.message);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// GET SINGLE EMPLOYEE
// ==========================
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const company_id = req.user.company_id;
        
        console.log(`🔍 Fetching employee ${id} for company ${company_id}`);
        
        const result = await pool.query(
            `SELECT e.*, u.email as user_email, u.role 
             FROM employees e
             LEFT JOIN users u ON e.user_id = u.id
             WHERE e.id = $1 AND e.company_id = $2`,
            [id, company_id]
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Employee not found');
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        console.log('✅ Employee found');
        
        res.json({
            success: true,
            employee: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Get employee error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// CREATE NEW EMPLOYEE
// ==========================
const createEmployee = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        const {
            first_name,
            last_name,
            email,
            phone,
            position,
            department,
            hire_date,
            salary,
            status
        } = req.body;
        
        console.log('📝 Creating employee for company:', company_id);
        console.log('📧 Employee email:', email);
        
        // Check if employee with this email already exists in company
        const existing = await pool.query(
            'SELECT id FROM employees WHERE company_id = $1 AND email = $2',
            [company_id, email]
        );
        
        if (existing.rows.length > 0) {
            console.log('❌ Employee already exists with this email');
            return res.status(400).json({
                success: false,
                message: 'Employee with this email already exists'
            });
        }
        
        // Insert new employee
        const result = await pool.query(
            `INSERT INTO employees (
                company_id, first_name, last_name, email, phone,
                position, department, hire_date, salary, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [company_id, first_name, last_name, email, phone, 
             position, department, hire_date, salary, status || 'active']
        );
        
        console.log('✅ Employee created with ID:', result.rows[0].id);
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            employee: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Create employee error:', error.message);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// UPDATE EMPLOYEE
// ==========================
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const company_id = req.user.company_id;
        const {
            first_name,
            last_name,
            phone,
            position,
            department,
            hire_date,
            salary,
            status
        } = req.body;
        
        console.log(`📝 Updating employee ${id} for company ${company_id}`);
        
        // Check if employee exists and belongs to company
        const check = await pool.query(
            'SELECT id FROM employees WHERE id = $1 AND company_id = $2',
            [id, company_id]
        );
        
        if (check.rows.length === 0) {
            console.log('❌ Employee not found');
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        // Update employee
        const result = await pool.query(
            `UPDATE employees 
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 phone = COALESCE($3, phone),
                 position = COALESCE($4, position),
                 department = COALESCE($5, department),
                 hire_date = COALESCE($6, hire_date),
                 salary = COALESCE($7, salary),
                 status = COALESCE($8, status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 AND company_id = $10
             RETURNING *`,
            [first_name, last_name, phone, position, department, 
             hire_date, salary, status, id, company_id]
        );
        
        console.log('✅ Employee updated successfully');
        
        res.json({
            success: true,
            message: 'Employee updated successfully',
            employee: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Update employee error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// DELETE EMPLOYEE (SOFT DELETE)
// ==========================
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const company_id = req.user.company_id;
        
        console.log(`🗑️ Deleting employee ${id} for company ${company_id}`);
        
        // Soft delete - just mark as inactive
        const result = await pool.query(
            `UPDATE employees 
             SET status = 'inactive', 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 AND company_id = $2
             RETURNING id`,
            [id, company_id]
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Employee not found');
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        console.log('✅ Employee deleted successfully');
        
        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete employee error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// GET EMPLOYEE STATISTICS (DASHBOARD OVERVIEW)
// ==========================
const getEmployeeStats = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        
        console.log('📊 Generating employee stats for company:', company_id);
        
        // Overall statistics
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_employees,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_employees,
                ROUND(AVG(salary)::numeric, 2) as average_salary,
                COUNT(DISTINCT department) as total_departments,
                COUNT(DISTINCT position) as total_positions,
                MIN(hire_date) as oldest_hire_date,
                MAX(hire_date) as newest_hire_date,
                MIN(salary) as min_salary,
                MAX(salary) as max_salary
            FROM employees 
            WHERE company_id = $1
        `, [company_id]);
        
        // Department breakdown
        const deptStats = await pool.query(`
            SELECT 
                department,
                COUNT(*) as employee_count,
                ROUND(AVG(salary)::numeric, 2) as avg_salary,
                MIN(salary) as min_salary,
                MAX(salary) as max_salary
            FROM employees 
            WHERE company_id = $1 AND status = 'active' AND department IS NOT NULL
            GROUP BY department
            ORDER BY employee_count DESC
        `, [company_id]);
        
        // Status breakdown
        const statusStats = await pool.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM employees 
            WHERE company_id = $1
            GROUP BY status
        `, [company_id]);
        
        // Recent hires (last 30 days)
        const recentHires = await pool.query(`
            SELECT 
                COUNT(*) as recent_hires
            FROM employees 
            WHERE company_id = $1 
                AND hire_date >= CURRENT_DATE - INTERVAL '30 days'
                AND status = 'active'
        `, [company_id]);
        
        console.log('✅ Stats generated successfully');
        
        res.json({
            success: true,
            stats: {
                overview: stats.rows[0],
                departments: deptStats.rows,
                by_status: statusStats.rows,
                recent_hires: recentHires.rows[0].recent_hires
            }
        });
        
    } catch (error) {
        console.error('❌ Stats error:', error.message);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// GET MONTHLY HIRES STATS (NEW)
// ==========================
const getMonthlyHires = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        
        console.log('📅 Generating monthly hires for company:', company_id);
        
        const result = await pool.query(`
            SELECT 
                EXTRACT(YEAR FROM hire_date) as year,
                EXTRACT(MONTH FROM hire_date) as month,
                COUNT(*) as hires_count
            FROM employees 
            WHERE company_id = $1 
                AND hire_date IS NOT NULL
                AND status = 'active'
            GROUP BY year, month
            ORDER BY year DESC, month DESC
            LIMIT 12
        `, [company_id]);
        
        res.json({
            success: true,
            monthly_hires: result.rows
        });
    } catch (error) {
        console.error('❌ Monthly hires error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// GET SALARY DISTRIBUTION (NEW)
// ==========================
const getSalaryDistribution = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        
        console.log('💰 Generating salary distribution for company:', company_id);
        
        // Salary brackets
        const brackets = await pool.query(`
            SELECT 
                CASE 
                    WHEN salary < 30000 THEN 'Under 30k'
                    WHEN salary BETWEEN 30000 AND 50000 THEN '30k - 50k'
                    WHEN salary BETWEEN 50001 AND 70000 THEN '50k - 70k'
                    WHEN salary BETWEEN 70001 AND 90000 THEN '70k - 90k'
                    WHEN salary BETWEEN 90001 AND 110000 THEN '90k - 110k'
                    WHEN salary BETWEEN 110001 AND 130000 THEN '110k - 130k'
                    WHEN salary BETWEEN 130001 AND 150000 THEN '130k - 150k'
                    ELSE 'Over 150k'
                END as salary_range,
                COUNT(*) as employee_count,
                ROUND(AVG(salary)::numeric, 2) as avg_salary
            FROM employees 
            WHERE company_id = $1 AND status = 'active' AND salary IS NOT NULL
            GROUP BY salary_range
            ORDER BY MIN(salary)
        `, [company_id]);
        
        // Department salary averages
        const deptSalary = await pool.query(`
            SELECT 
                department,
                COUNT(*) as employee_count,
                ROUND(AVG(salary)::numeric, 2) as avg_salary,
                MIN(salary) as min_salary,
                MAX(salary) as max_salary
            FROM employees 
            WHERE company_id = $1 AND status = 'active' AND salary IS NOT NULL
            GROUP BY department
            ORDER BY avg_salary DESC
        `, [company_id]);
        
        res.json({
            success: true,
            salary_distribution: brackets.rows,
            department_salaries: deptSalary.rows
        });
    } catch (error) {
        console.error('❌ Salary distribution error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// GET DEPARTMENT STATS (NEW)
// ==========================
const getDepartmentStats = async (req, res) => {
    try {
        const company_id = req.user.company_id;
        
        console.log('🏢 Generating department stats for company:', company_id);
        
        const result = await pool.query(`
            SELECT 
                department,
                COUNT(*) as total_employees,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
                ROUND(AVG(salary)::numeric, 2) as avg_salary,
                MIN(salary) as min_salary,
                MAX(salary) as max_salary,
                COUNT(DISTINCT position) as unique_positions
            FROM employees 
            WHERE company_id = $1 AND department IS NOT NULL
            GROUP BY department
            ORDER BY total_employees DESC
        `, [company_id]);
        
        res.json({
            success: true,
            departments: result.rows
        });
    } catch (error) {
        console.error('❌ Department stats error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// ==========================
// EXPORT ALL FUNCTIONS
// ==========================
module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats,
    getMonthlyHires,        // NEW
    getSalaryDistribution,  // NEW
    getDepartmentStats      // NEW
};