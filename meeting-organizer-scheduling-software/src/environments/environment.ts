// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl:                   `http://${location.host.split(':')[0]}:3000`,
                                  // Use the ip of the server where the REST API runs. Not localhost. This cost me about 3hrs in debugging before noticing
                                  // That the client's browser calls this url, not the server.
  
  // Google API
  G_API_CLIENT_ID:          '',
  G_API_CLIENT_SECRET:      '',
  G_API_REDIRECT_URL:       `http://${location.host}/profile/calendars/auth/google`,

  // Microsoft Graph API
  M_API_APP_ID:             '',
  M_API_SCOPES:             ["user.read", "calendars.ReadWrite", "offline_access"],
  M_API_SCOPES_URI:         "https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read offline_access openid profile",
  M_API_REDIRECT_URI:       `http://${location.host}/profile/calendars/auth/microsoft`,

  // Apple API
  A_API_CLIENT_ID:          "",
  A_API_REDIRECT_URI:       `http://${location.host}/profile/calendars/auth/apple`,
  A_API_STATE:              "apple_state_98712386abaafgra", // Can be anything, should be not easily guessable as it protects against CSRF Attacks
  A_API_SCOPE:              "calendar",
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
