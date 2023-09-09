const crypto = require('crypto');

function generateSecret(length) {
    return crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
}

console.log(generateSecret(32));