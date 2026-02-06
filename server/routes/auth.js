const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const {
            email,
            phone,
            password,
            full_name,
            address_thana,
            address_zilla,
            blood_type,
            want_to_donate // Boolean: true if user wants to be a donor
        } = req.body;

        // Validation
        if (!email || !phone || !password || !full_name || !address_thana || !address_zilla || !blood_type) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Phone validation (Bangladesh format)
        const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: 'Invalid phone number. Use Bangladesh format (+8801XXXXXXXXX or 01XXXXXXXXX)' });
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if email already exists
        const [existingEmail] = await db.query('SELECT id, is_suspended FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            if (existingEmail[0].is_suspended) {
                return res.status(403).json({ error: 'Email is banned' });
            }
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Check if phone already exists
        const [existingPhone] = await db.query('SELECT id, is_suspended FROM users WHERE phone = ?', [phone]);
        if (existingPhone.length > 0) {
            if (existingPhone[0].is_suspended) {
                return res.status(403).json({ error: 'Phone number is banned' });
            }
            return res.status(409).json({ error: 'Phone number already registered' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Determine roles
        const is_donor = want_to_donate === true;
        const is_receiver = !want_to_donate; // If not donor, default to receiver

        // Insert user
        const [result] = await db.query(
            `INSERT INTO users (email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_donor, is_receiver)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_donor, is_receiver]
        );

        // Log registration
        await db.query(
            'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [result.insertId, 'USER_REGISTERED', 'user', result.insertId, `New user registered: ${email}`]
        );

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: result.insertId,
                email,
                full_name,
                is_donor,
                is_receiver
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email_or_phone, password } = req.body;

        if (!email_or_phone || !password) {
            return res.status(400).json({ error: 'Email/phone and password are required' });
        }

        // Find user by email or phone
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? OR phone = ?',
            [email_or_phone, email_or_phone]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check if account is suspended
        if (user.is_suspended) {
            return res.status(403).json({
                error: 'Account suspended',
                reason: user.suspension_reason
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Determine default role
        let default_role = 'receiver';
        if (user.is_admin) {
            default_role = 'admin';
        } else if (user.is_staff) {
            default_role = 'staff';
        } else if (user.is_donor && !user.is_receiver) {
            default_role = 'donor';
        } else if (user.is_receiver && !user.is_donor) {
            default_role = 'receiver';
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                current_role: default_role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Log login
        await db.query(
            'INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)',
            [user.id, 'USER_LOGIN', `User logged in: ${user.email}`]
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                is_donor: user.is_donor,
                is_receiver: user.is_receiver,
                is_staff: user.is_staff,
                is_admin: user.is_admin,
                current_role: default_role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.*, z.name as zilla_name, t.name as thana_name
             FROM users u
             LEFT JOIN zillas z ON u.address_zilla = z.id
             LEFT JOIN thanas t ON u.address_thana = t.id
             WHERE u.id = ?`,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        delete user.password_hash; // Remove sensitive data

        res.json({ user });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Switch role (for dual-role users)
router.post('/switch-role', verifyToken, async (req, res) => {
    try {
        const { new_role } = req.body;

        if (!['donor', 'receiver', 'staff', 'admin'].includes(new_role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Verify user has the requested role
        if (new_role === 'donor' && !req.user.is_donor) {
            return res.status(403).json({ error: 'You do not have donor role enabled' });
        }
        if (new_role === 'receiver' && !req.user.is_receiver) {
            return res.status(403).json({ error: 'You do not have receiver role enabled' });
        }
        if (new_role === 'staff' && !req.user.is_staff) {
            return res.status(403).json({ error: 'You do not have staff role' });
        }
        if (new_role === 'admin' && !req.user.is_admin) {
            return res.status(403).json({ error: 'You do not have admin role' });
        }

        // Generate new token with updated role
        const token = jwt.sign(
            {
                userId: req.user.userId,
                current_role: new_role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Role switched successfully',
            token,
            current_role: new_role
        });

    } catch (error) {
        console.error('Switch role error:', error);
        res.status(500).json({ error: 'Failed to switch role' });
    }
});

module.exports = router;
