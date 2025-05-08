// middleware/auth_middleware.js
const jwt = require('jsonwebtoken');
const tokenModel = require('../models/tokenModel');
const { Messages } = require('../helpers/Messages');
const { sendResponse } = require('../helpers/Response');

// Middleware to generate JWT token
const GenerateToken = (userId) => {
  return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '48h' });
};

// Middleware to protect routes (check for valid JWT token)
ValidateToken = async (req, res, next) => {
  try {
    const rawToken = req.headers.authorization || req.headers.Authorization;
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
    const secretKey = process.env.SECRET_KEY

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, secretKey);
    } catch (err) {
      return sendResponse(res, 401, null, Messages.UNAUTHORIZED);
    }

    const { userId } = decodedToken;

    const tokenFromDb = await tokenModel.findOne({ userId: decodedToken?.userId });
    const {userType} = tokenFromDb
;
    if (!tokenFromDb) {
      return sendResponse(res, 401, null, Messages.UNAUTHORIZED);
    }

    if (tokenFromDb?.expiryTime <= new Date()) {
      return sendResponse(res, 401, null, Messages.JWT_EXPIRED);
    }
    req.meta = {
      _id: userId,
      userType,
    };
    next();
  } catch (err) {
    console.log('err :>> ', err);
    return sendResponse(res, 500, null, err.message);
  }
};

module.exports = { GenerateToken, ValidateToken };
