// Partly from https://jasonwatmore.com/post/2018/06/14/nodejs-mongodb-simple-api-for-authentication-registration-and-user-management

require('dotenv').config();
const expressJWT = require('express-jwt');
const User = require('../models/user');

module.exports = jwt;

function jwt() {
  const secret = process.env.JWT_SECRET;
  return expressJWT({ secret, isRevoked }).unless({
    path: [
      '/users/authenticate',
      '/users/register',
      '/users/activate',
      '/users/:id/2fa'
    ]
  });
}

async function isRevoked(req, payload, next) {
  // get user by id but exclude password hash
  const user = await User.findById(payload.sub).select('-password');

  // revoke token if user no longer exists
  if (!user) {
    return next(null, true);
  }

  next();
}