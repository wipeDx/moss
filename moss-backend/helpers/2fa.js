const otplib = require('otplib');
const qrcode = require('qrcode');

const authenticator = otplib.authenticator;
module.exports = {
  generateSecret: function() {
    return authenticator.generateSecret();
  },
  generateQRCode: async function(user, secret) {
    const otpauth = authenticator.keyuri(user.email, 'MOSS', secret);
    return qrcode.toDataURL(otpauth);;
  },
  /**
   * Checks whether the token matches the secret at the current time.
   * Returns true or false
   * @param {Number} token The token that the user gives the website from their device
   * @param {String} userSecret The secret that the server and the client uses to generate the OTP
   */
  verifyToken: function(token, userSecret) {
    return authenticator.check(token, userSecret);
  }
}