require('dotenv').config();
const appleSignIn = require('apple-signin');

module.exports = {
  getAuthURL: function() {
      const options = {
        clientID: process.env.A_API_CLIENT_ID,
        redirectUri: process.env.A_API_REDIRECT_URI,
        state: process.env.A_API_STATE,
        scope: process.env.A_API_SCOPE
      };
      const url = appleSignIn.getAuthorizationUrl(options);
      console.log(url);
      return url;
  },

  getAccessToken: async function(code) {
    // Get the client secret
    const clientSecret = appleSignin.getClientSecret({
      clientID: process.env.A_API_CLIENT_ID, // identifier of Apple Service ID.
      teamId: process.env.A_API_TEAM_ID, // Apple Developer Team ID.
      privateKeyPath: process.env.A_API_PRIVATE_KEY_PATH, // path to private key associated with your client ID.
      keyIdentifier: process.env.A_API_KEY_IDENTIFIER // identifier of the private key.    
    });

    const options = {
      clientID: process.env.A_API_CLIENT_ID, // identifier of Apple Service ID.
      redirectUri: process.env.A_API_REDIRECT_URI, // use the same value which you passed to authorisation URL.
      clientSecret: clientSecret
    };
    return appleSignin.getAuthorizationToken(code, options).then(tokenResponse => {
        return tokenResponse;
    }).catch(error => {
      console.error(error);                            
        return error;
    });
  }
}