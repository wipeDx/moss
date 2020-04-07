export const environment = {
  production: true,
  apiUrl:                   `http://${location.host.split(':')[0]}:3000`,
                                  // Use the ip of the server where the REST API runs. Not localhost. This cost me about 3hrs in debugging before noticing
                                  // That the client's browser calls this url, not the server.
  
  // Google API
  G_API_CLIENT_ID:          '',
  G_API_CLIENT_SECRET:      '',
  G_API_REDIRECT_URL:       `http://${location.host}/profile/calendars/auth/google`,

  // Microsoft Graph API
  M_API_APP_ID:             '',
  M_API_SCOPES:             ['user.read', 'calendars.ReadWrite', 'offline_access'],
  M_API_SCOPES_URI:         'https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read offline_access openid profile',
  M_API_REDIRECT_URI:       `http://${location.host}/profile/calendars/auth/microsoft`,
};
