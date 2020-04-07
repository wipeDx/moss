const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Groups = require('../models/group')
const jwt = require('jsonwebtoken');
const microsoftService = require('../helpers/microsoft');
const googleService = require('../helpers/google');
const appleService = require('../helpers/apple');
const icsService = require('../helpers/ics');
const crypto = require('crypto');
const email = require('../helpers/email');
const twoFA = require('../helpers/2fa');

// Getting all
router.get('/', async (req, res) => {
  try {
    // Search for all users async
    const users = await User.find()
      .select('-password -activated -activateToken')
      .populate('groups')
    res.json(users)
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// Search
router.get('/search/:term', async (req, res) => {
  try {
    // Search for all users async

    // https://stackoverflow.com/a/6969486
    const escapedTerm = req.params.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const users = await User.find(
      { // It's horrible when the search only works when 4 characters are present and you have to
        // solve the problem using regex.
        $or: [
          { email: { $regex: `^[a-z.]*[@]?${escapedTerm}[@]?[a-z.]*[@]?[a-z.]*$`, $options: 'im'} },
          { name: { $regex: `^[a-z ]*${escapedTerm}[a-z ]*$`, $options: 'im'} }
        ]
      })
      .select('-password -activated -activateToken -otpSecret -uses2FA')
      .populate('calendars')
      .populate('groups')
    res.json(users)
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// POST user in order to authenticate
// Partly from https://jasonwatmore.com/post/2018/06/14/nodejs-mongodb-simple-api-for-authentication-registration-and-user-management#user-service-js
router.post('/authenticate', async (req, res) => {
  try {
    
    // Search for all users async
    const user = await User.findOne({ email: req.body.email })
    const valid2FA = user.uses2FA ? twoFA.verifyToken(req.body.otpToken, user.otpSecret) : undefined;
    // Check credentials
    if (user && (req.body.password === user.password)) {
      if (!user.activated) {
        console.log("User is not activated");
        res.status(400).json({ message: 'Account is not activated' })
      }
      else if (user.uses2FA && (!req.body.otpToken || req.body.otpToken === "")) {
        res.status(400).json({ message: '2FA needed'})
      }
      else if (user.uses2FA && !valid2FA) {
        res.status(400).json({ message: 'Invalid 2FA token'})
      }
      else {
        const { password, otpSecret, ...userWithoutPassword } = user.toObject();
        const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
        res.json({ ...userWithoutPassword, token });
      }
      
    }
    else {
      res.status(400).json({ message: 'Username or password is incorrect.'})
    }
    
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

router.post('/activate', async (req, res) => {
  try {
    // Search for all users async
    const user = await User.findOne({ email: req.body.email })
    // Check credentials
    if (user && req.body.token === user.activateToken) {
        user.activated = true;
        await user.save();
        const { password, otpSecret, ...userWithoutPassword } = user.toObject();
        const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
        res.json({ ...userWithoutPassword, token });
    }
    else {
      res.status(400).json({ message: 'Couldn\'t find user or activation token is wrong.'})
    }
    
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// POST user in order to authenticate
// Partly from https://jasonwatmore.com/post/2018/06/14/nodejs-mongodb-simple-api-for-authentication-registration-and-user-management#user-service-js
router.post('/updateLocalUser', async (req, res) => {
  try {
    // Search for all users async
    const user = await User.findOne({ email: req.body.email })
    const token = req.body.token;

    // Check credentials
    if (user) {
      const { password, otpSecret, ...userWithoutPassword } = user.toObject();
      res.json({...userWithoutPassword, token});
    }
    else {
      res.status(400).json({ message: 'Username is incorrect.'})
    }
    
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// Search for groups of user
router.get('/:id/groups/search/:term', getUser, async (req, res) => {
  try {
    // https://stackoverflow.com/a/6969486
    const escapedTerm = req.params.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const user = await User.findById(req.params.id)
      .populate('groups', '_id')
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user' })
    }
    const groups = await Groups
      .find({_id: {$in: user.groups}, name: { $regex: `^([a-z]*[ ]*(\\d)*)*${escapedTerm}([a-z]*[ ]*(\\d)*)*$`, $options: 'igm'} })
      .populate('members', '-password -otpSecret -uses2FA')
    res.json(groups)
  } catch(err) {
    // Send error 500 ("Server Error")
    // as well as err message
    res.status(500).json({ message: err.message })
  }
})

// Getting one
router.get('/:id', getUser, (req, res) => {
  res.json(res.user)
})

// Getting groups of one
router.get('/:id/groups', getUser, (req, res) => {
  res.json(res.user.groups)
})

// Getting calendars of one
router.get('/:id/calendars', getUser, (req, res) => {
  res.json(res.user.calendars)
})

// Creating new calendar of type google
router.post('/:id/calendars/google', getUser, async (req, res) => {
  //console.log(req.body);
  try {
    const tokens = await googleService.requestTokenFromCode(req.body.code);
    const calName = await googleService.getCalendarName(tokens);
    

    if (doesCalendarExist(res.user.calendars, calName)) {
      res.status(409).json({ message: "Calendar already exists" });
    }
    else { 
      res.user.calendars.push({
        accessIdentifier: tokens,
        type: 'Google',
        name: calName
      });
      const updatedUser = await res.user.save()
      const { password, otpSecret, ...userWithoutPassword } = updatedUser.toObject();
      res.json({...userWithoutPassword});
    }
  } catch (err) {
    res.status(400).json({ message: err })
  }
  res.json()
})

// Creating new calendar of type microsoft
router.post('/:id/calendars/microsoft', getUser, async (req, res) => {
  
  try {
    microsoftService.requestTokenFromCode(req.body.code, async function(err, data) {
      if (!data) {
        console.log(`Error while requesting token from code:\n${err.response.data.error}: ${err.response.data.error_description}`)
        //console.log(`Error while requesting token from code:\n${err.data.error}: ${err.data.error_description}`)
        res.status(400).json({ message: "Error while retrieving authorization key. Try again in a few minutes" })
      }
      else {
        const calendarName = await microsoftService.getCalendarName(data)
        
        // check if calendar exists
        if (doesCalendarExist(res.user.calendars, calendarName)) {
          // Status code 409: Conflict
          res.status(409).json({ message: "Calendar already exists"});
        }
        else {
          // Add time of creation so we can verify that the token is expired
          data.tokenCreated = new Date(Date.now()).getTime();
          res.user.calendars.push({
            name: calendarName,
            type: "Microsoft",
            accessIdentifier: data
          });
          const updatedUser = await res.user.save()
          //console.log(updatedUser);
          //console.log(res.user);
          const { password, otpSecret, ...userWithoutPassword } = updatedUser.toObject();
          res.json({...userWithoutPassword});
        }
      }
    });
    
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

// Create a new calendar of type ICS
router.post('/:id/calendars/ics', getUser, async (req, res) => {
  try {
    console.log(req.body);
    req.body.accessIdentifier = icsService.parseURI(req.body.accessIdentifier);
    const valid = icsService.checkICSFeed(req.body.accessIdentifier);
    if (valid) {
      if (doesCalendarExistURI(res.user.calendars, req.body.accessIdentifier)) {
        res.status(409).json({ message: 'Calendar with the same URI already existed' })
      }
      else {
        res.user.calendars.push(req.body);
        const updatedUser = await res.user.save();
        const { password, otpSecret, ...userWithoutPassword } = updatedUser.toObject();
        res.json({ ...userWithoutPassword });
      }
    }
    else {
      res.status(400).json({ message: 'Something went wrong' });
    }
    
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

// Get Auth URL for an apple calendar
router.get('/:id/calendars/apple/authURL', async (req, res) => {
  try {
    res.json({ url: appleService.getAuthURL() });
  }
  catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
})

// Creating one
router.post('/register', async (req, res) => {
  try {
    // Take data from the requst sent to server
    const activateToken = await generateActivationToken();
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      activated: false,
      activateToken: activateToken,
      calendars: req.body.calendars,
      groups: req.body.groups
    })
    console.log(user);
    if (await User.findOne({ email: user.email })) {
      res.status(400).json({ message: `Email ${user.email} is already taken`})
    }
    // try to save it into MongoDB
    const newUser = await user.save()
    // Send Email verification link
    email.sendVerificationLink(req.body.email, activateToken);
    // return "successfully created object" with the object
    res.status(201).json(newUser)
  } catch(err) {
    // user input data is wrong
    res.status(400).json({ message: err.message })
  }
})

// Verifying 2FA
router.post('/:id/2fa', getUser, async (req, res) => {
  try {
    if (twoFA.verifyToken(req.body.token, res.user.otpSecret)) {
      if (req.body.enabling) {
        res.user.uses2FA = true;
        await res.user.save();
        email.send2FAVerificationEnabled(res.user.email);
      }
      res.status(200).json({ message: 'Authenticated'})
    }
    else {
      res.status(400).json({ message: 'Token did not match secret' })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error })
  }
})

router.get('/:id/2fa', getUser, async (req, res) => {
  try {
    const secret = twoFA.generateSecret();
    const response = {
      secret: secret,
      qrURI: await twoFA.generateQRCode(res.user, secret)
    }
    res.user.otpSecret = secret;
    await res.user.save();
    res.json(response)
  } catch (error) {
    res.status(500).json({ message: error });
  }
})

// Deleting2FA
router.delete('/:id/2fa/:token', getUser, async (req, res) => {
  try {
    if (twoFA.verifyToken(req.params.token, res.user.otpSecret)) {
      res.user.uses2FA = false;
      res.user.otpSecret = "";
      await res.user.save();
      email.send2FAVerificationRemoved(res.user.email);
      res.status(200).json({ message: '2FA successfully removed'})
    }
    else {
      res.status(400).json({ message: 'Token did not match secret' })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error })
  }
})

// Updating one
router.patch('/:id', getUser, async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name
  }
  if (req.body.email != null) {
    res.user.email = req.body.email
  }
  if (req.body.password != null) {
    res.user.password = req.body.password
  }
  if (req.body.calendars != null) {
    res.user.calendars = req.body.calendars
  }
  if (req.body.groups != null) {
    res.user.groups = req.body.groups
  }
  if (req.body.uses2FA != null) {
    res.user.uses2FA = req.body.uses2FA
  }

  try {
    const updatedUser = await res.user.save()
    res.json(updatedUser)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Deleting one
router.delete('/:id', getUser, async (req, res) => {
  try {
    console.log(req.body)
    // call middleware and remove the requested user
    //await res.user.remove()
    res.json({ message: 'Deleted user' })
  } catch(err) {
    // something went wrong in the server
    res.status(500).json({ message: err.message })
  }
})

// Middleware function
async function getUser(req, res, next) {
  let user
  try {
    user = await User.findById(req.params.id)
      .populate('groups')
    if (user == null) {
      // User not found / does not exist
      return res.status(404).json({ message: 'Cannot find user' })
    }
  } catch(err) {
    return res.status(500).json({ message: err.message })
  }

  res.user = user
  next()
}

/**
 * Generates a 256 Byte hex string used to activate an account
 */
async function generateActivationToken() {
  return crypto.randomBytes(256).toString('hex');
}

// Simple loop over all calendars to check for existing calendars
function doesCalendarExist(calendars, newCalendarName) {
  let exists = false;
  calendars.forEach(calendar => {
    console.log(calendar);
    if (calendar.name === newCalendarName) {
      console.log("Calendar existed");
      exists = true;
    }
  })
  return exists;
}

// Simple loop over all calendars to check for existing calendars but this time with ICS Link
function doesCalendarExistURI(calendars, newCalendarURI) {
  let exists = false;
  console.log(calendars);
  calendars.forEach(calendar => {
    console.log(calendar);
    if (calendar.accessIdentifier === newCalendarURI) {
      console.log("Calendar existed");
      exists = true;
    }
  })
  return exists;
}

module.exports = router