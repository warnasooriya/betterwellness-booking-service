const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const iss = `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;

const client = jwksClient({
    jwksUri: `${iss}/.well-known/jwks.json`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err, null);
        }
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const tokenString = token.replace('Bearer ', '');

    jwt.verify(tokenString, getKey, {
        issuer: iss,
        algorithms: ['RS256']
    }, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        req.user = decoded; // Attach user info to request
        next();
    });
};

module.exports = verifyToken;
