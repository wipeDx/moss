# Meeting-Organizer-Scheduling-Software
An Angular (8) application trying to solve the manual labor of scheduling meetings.

## Requirements
* A functional MongoDB setup, preferrably with authentication
* Node.JS
* npm

## Installation (quick)
For a full installation guide, go to the [installation guide](installation-guide/README.md)
### Front-end
Clone the repo then execute
```
$ cd meeting-organizer-scheduling-software/
$ npm install
```
Change the file `meeting-organizer-scheduling-software/src/environment.ts`

Enter specific API credentials gotten from the respective dashboards. Leave REDIRECT_URL and SCOPES the same.
```
// Google API
G_API_CLIENT_ID:          '',
G_API_CLIENT_SECRET:      '',
G_API_REDIRECT_URL:       `http://${location.host}/profile/calendars/auth/google`,
// Microsoft Graph API
M_API_APP_ID:             '',
M_API_SCOPES:             ["user.read", "calendars.ReadWrite", "offline_access"],
M_API_SCOPES_URI:         "https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read offline_access openid profile",
M_API_REDIRECT_URI:       `http://${location.host}/profile/calendars/auth/microsoft`,
```

### Back-end

```
$ cd ../moss-backend
$ npm install
$ cp example.env .env
```
Edit the just copied `.env` file according to the API credentials. Note that Apple is not supported (yet?).
## Usage
Two terminals are needed (tmux might help!)

### Front-end
```
$ cd meeting-organizer-scheduling-software/
$ ng serve --open
```

### Back-end
```
$ cd moss-backend
$ npm start
```
This should be displayed in the console:
```
Server has started
Connected to Database
Server ready to send messages
```

## Known issues
Due to the nature of OAuth2.0, if only localhost is entered within Google's or Microsoft's developer dashboards, clients accessing the server from a non-localhost device cannot connect third party calendars. This can be circumvented by giving the server a domain and access it through that.
