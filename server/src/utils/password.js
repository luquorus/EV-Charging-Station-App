/**
 * Password utilities
 * Hash and verify passwords using bcrypt
 */

const crypto = require('crypto');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  // Using crypto.pbkdf2Sync as fallback (bcryptjs requires npm install)
  // In production, use: const bcrypt = require('bcryptjs'); return bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function verifyPassword(password, hash) {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(key === derivedKey.toString('hex'));
    });
  });
}

module.exports = {
  hashPassword,
  verifyPassword,
};

