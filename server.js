require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const app = express();

// ==========================
// MIDDLEWARE
// ==========================

app.use(cors());
app.use(express.json());

// ==========================
// DATABASE CONNECTION
// ==========================

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "pharmacomply360",
    password: "",
    port: 5432,
});

// ==========================
// AUTH MIDDLEWARE
// ==========================

const authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        req.user = {
            id: decoded.userId,
            company_id: decoded.companyId || 1,
            role: decoded.role || 'admin'
        };
        
        console.log('✅ Auth success for user:', req.user.id);
        next();
    } catch (error) {
        console.error('❌ Auth error:', error.message);
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
};

// ==========================
// BASIC TEST ROUTES
// ==========================

app.get("/", (req, res) => {
    res.send("PharmaComply360 Backend is Running 🚀");
});

app.get("/practice", (req, res) => {
    res.json({ message: "Practice route working ✅" });
});

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Database connected successfully ✅",
            time: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database connection failed ❌" });
    }
});

// ==========================
// DEBUG ROUTES (TEST FIRST!)
// ==========================

app.get('/api/test', (req, res) => {
    console.log('🔥 TEST ROUTE HIT!');
    res.json({ success: true, message: 'API is working!' });
});

app.get('/api/test-auth', authenticate, (req, res) => {
    console.log('🔥 AUTH TEST ROUTE HIT!');
    res.json({ success: true, message: 'Auth working!', user: req.user });
});

// ==========================
// AUTH ROUTES
// ==========================

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('📝 Register attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password are required" });
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('🔐 Password hashed');

        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, hashedPassword]
        );
        
        console.log('✅ User registered successfully:', email);

        const token = jwt.sign(
            { userId: result.rows[0].id, companyId: 1, role: 'admin' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully ✅",
            token: token,
            user: { id: result.rows[0].id, email: result.rows[0].email }
        });
    } catch (error) {
        console.error('❌ Register error:', error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('📝 Login attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password are required" });
        }

        const user = await pool.query(
            "SELECT id, email, password_hash FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "User not found ❌" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password ❌" });
        }

        console.log('✅ Login successful for:', email);

        const token = jwt.sign(
            { userId: user.rows[0].id, companyId: 1, role: 'admin' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: "Login successful ✅",
            token: token,
            user: { id: user.rows[0].id, email: user.rows[0].email }
        });
    } catch (error) {
        console.error('❌ Login error:', error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ==========================
// EMPLOYEE ROUTES
// ==========================

console.log('📦 Loading employee routes...');
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);
console.log('✅ Employee routes mounted');

// ==========================
// COMPLIANCE ROUTES
// ==========================

console.log('📦 Loading compliance routes...');
const complianceRoutes = require('./routes/complianceRoutes');
app.use('/api/compliance', complianceRoutes);
console.log('✅ Compliance routes mounted');

// ==========================
// REGULATION ROUTES
// ==========================

console.log('📦 Loading regulation routes...');
const regulationRoutes = require('./routes/regulationRoutes');
app.use('/api/regulations', regulationRoutes);
console.log('✅ Regulation routes mounted');

// ==========================
// SERVER START
// ==========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`✅ TEST THESE FIRST:`);
    console.log(`   - GET  /api/test`);
    console.log(`   - GET  /api/test-auth (needs token)`);
    console.log(`✅ EMPLOYEE ROUTES:`);
    console.log(`   - GET    /api/employees`);
    console.log(`✅ COMPLIANCE ROUTES:`);
    console.log(`   - GET    /api/compliance`);
    console.log(`✅ REGULATION ROUTES:`);
    console.log(`   - GET    /api/regulations/test`);
    console.log(`   - POST   /api/regulations/upload`);
});