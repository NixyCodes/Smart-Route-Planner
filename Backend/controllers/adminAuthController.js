const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, JWT_SECRET, JWT_EXPIRES_IN } = require('../config/admin');

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username !== ADMIN_USERNAME) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { username: ADMIN_USERNAME, role: 'admin' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
        message: 'Login successful',
        token,
        admin: { username: ADMIN_USERNAME, role: 'admin' },
    });
};

exports.verify = (req, res) => {
    // If we reach here, requireAdmin middleware already validated the token
    res.json({ valid: true, admin: req.admin });
};
