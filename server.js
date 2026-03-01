require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

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
    database: "pharmadb",
    password: "", // keep empty if no password
    port: 5432,
});

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
// REGISTER (POST)
// ==========================

app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required",
            });
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully ✅",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error ❌" });
    }
});

// ==========================
// TEMP REGISTER TEST (GET)
// ==========================

app.get("/register-test", async (req, res) => {
    try {
        const { email, password } = req.query;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password required",
            });
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hashedPassword]
        );

        res.json({
            message: "User registered successfully ✅",
            email: email,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error ❌" });
    }
});

// ==========================
// TEMP LOGIN TEST (GET)
// ==========================

app.get("/login-test", async (req, res) => {
    try {
        const { email, password } = req.query;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password required",
            });
        }

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({
                message: "User not found ❌",
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!validPassword) {
            return res.status(400).json({
                message: "Invalid password ❌",
            });
        }

        res.json({
            message: "Login successful ✅",
            email: user.rows[0].email,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error ❌" });
    }
});

// ==========================
// SERVER START
// ==========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});