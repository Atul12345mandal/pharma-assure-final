const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// SECRET key for JWT (keep it safe in .env)
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// REGISTER NEW USER
const registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }

    try {
        // 1️⃣ Check if user exists
        const userExists = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2️⃣ Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3️⃣ Save user
        const newUser = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, hashedPassword]
        );

        // 4️⃣ Send JWT token
        const token = jwt.sign({ id: newUser.rows[0].id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ token, user: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// LOGIN USER
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1️⃣ Find user
        const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 2️⃣ Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3️⃣ Send JWT
        const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ token, user: { id: user.rows[0].id, email: user.rows[0].email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET LOGGED-IN USER
const getMe = async (req, res) => {
    try {
        const user = await pool.query("SELECT id, email FROM users WHERE id=$1", [req.user.id]);
        res.status(200).json({ user: user.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { registerUser, loginUser, getMe };