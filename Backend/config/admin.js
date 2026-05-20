// Admin credentials - password hash is bcrypt of 'Admin@123'
module.exports = {
    ADMIN_USERNAME:      'admin',
    ADMIN_PASSWORD_HASH: '$2b$10$2C/HsikbSEhSTj2l36WD9O.W6nEM6XhnMhmPAx5Csk4Csmj2K/C.y',
    JWT_SECRET:          process.env.JWT_SECRET || 'skyroute_admin_jwt_2024_secret',
    JWT_EXPIRES_IN:      '8h',
};
