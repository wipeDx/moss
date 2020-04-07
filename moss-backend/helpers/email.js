require('dotenv').config();
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: (process.env.SMTP_SECURE === "true"),  // If false: uses STARTTLS to upgrade at later point
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


module.exports = {
  verifySMTP: function() {
    if (process.env.SMTP_ENABLED === "true") {
      transporter.verify((err, suc) => err ? console.log("Server is not ready to send emails") : console.log("Server ready to send emails"));
    }
  },
  closeConnection: function() {
    if (process.env.SMTP_ENABLED === "true") {
      transporter.close();
    }
  },
  sendMail: function(message) {
    if (process.env.SMTP_ENABLED === "true") {
      transporter.sendMail(message, (err, info) => err ? console.log(err) : console.log(info));
    }
  },
  sendTestMail: function() {
    let mail = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_DEBUG_RECEIVER,
      envelope: {
        from: `Noreply MOSS <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_DEBUG_RECEIVER
      }
    }
    transporter.sendMail(mail, (err, info) => err ? console.log(err) : console.log(info));
  },
  sendVerificationLink: function(userEmail, activateToken) {
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS Account Verification Link',
      text: `Welcome to MOSS!\nIn order to use your account, please visit ${process.env.SMTP_URI}/activate/?email=${userEmail}&token=${activateToken} \nThank you!`,
      html: `<h1>Welcome to MOSS!</h1><br>In order to use your account, please visit <a href="${process.env.SMTP_URI}/activate/?email=${userEmail}&token=${activateToken}">this link</a>.\nThank you!`
    }
    this.sendMail(message);
  },
  sendMeetingInvited: function(userEmail, meeting) {
    //console.log(meeting);
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS - You have been invited to a meeting',
      text: `You have been invited to a meeting by ${meeting.creator}. To see details and give an answer, please visit ${process.env.SMTP_URI}/meetings/view/${meeting._id}`,
      html: `<h1>You have been invited to a meeting by ${meeting.creator}!</h1><br>To see details and give an answer, please visit <a href="${process.env.SMTP_URI}/meetings/view/${meeting._id}">this link</a>.`
    }
    this.sendMail(message);
  },
  sendMeetingCreated: function(userEmail, meeting) {
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS - Sucessfully created meeting',
      text: `Your meeting has successfully been created. To edit, please visit ${process.env.SMTP_URI}/meetings/edit/${meeting._id}`,
      html: `<h1>Your meeting has successfully been created!</h1><br>To edit, please visit <a href="${process.env.SMTP_URI}/meetings/edit/${meeting._id}">this link</a>.`
    }
    this.sendMail(message);
  },
  sendMeetingDeleted: function(userEmail, meeting) {
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS - A meeting has been deleted',
      text: `A meeting that you've been invited to has been deleted. It was created by ${meeting.creator.name} and was named ${meeting.name}.`,
      html: `A meeting that you've been invited to has been deleted.<br>It was created by ${meeting.creator.name} and was named ${meeting.name}..`
    }
    this.sendMail(message);
  },
  sendMeetingSet: function(userEmail, meeting) {
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS - A meeting has been set',
      text: `A meeting you've been invited to has been set.
      Everybody has answered and everybody has agreed to a time.
      To view, please visit ${process.env.SMTP_URI}/meetings/view/${meeting._id}`,
      email: `<h1>A meeting you've been invited to has been set</h1><br>
      Everybody has answered and everybody has agreed to a time.<br>
      To view, please visit ${process.env.SMTP_URI}/meetings/view/${meeting._id}`
    }
    this.sendMail(message);
  },
  sendMeetingCancelled: function(userEmail, meeting) {
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS - A meeting has been cancelled',
      text: `A meeting you've been invited to has been cancelled.
      The meeting can be viewed here: ${process.env.SMTP_URI}/meetings/view/${meeting._id}
      ${meeting}`,
      email: `<h1>A meeting you've been invited to has been set</h1><br>
      The meeting can be viewed <a href="${process.env.SMTP_URI}/meetings/view/${meeting._id}">here</a>.<br>
      ${meeting}`
    }
    this.sendMail(message);
  },
  sendMeetingTimesChanged: function(userEmail, meeting) {
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS - A meeting has been changed',
      text: `A meeting you've been invited to has been changed.
      The new info can be viewed here: ${process.env.SMTP_URI}/meetings/view/${meeting._id}`,
      email: `<h1>A meeting you've been invited to has been changed</h1><br>
      The new info can be viewed <a href="${process.env.SMTP_URI}/meetings/view/${meeting._id}">here</a>`
    }
    this.sendMail(message);
  },
  send2FAVerificationEnabled: function(userEmail) {
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS - Successfully activated 2 factor authentication',
      text: `You have successfully enabled 2 Factor Authentication.`,
      email: `<h1>You have successfully enabled 2 Factor Authentication</h1>`
    }
    this.sendMail(message);
  },
  send2FAVerificationRemoved: function(userEmail) {
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS - Successfully removed 2 factor authentication',
      text: `You have successfully removed 2 Factor Authentication.`,
      email: `<h1>You have successfully removed 2 Factor Authentication</h1>`
    }
    this.sendMail(message);
  },
  sendAllInviteesAnswered: function(userEmail, meeting) {
    let message = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'MOSS - All invitees have answered to a meeting',
      text: `All your invitees to "${meeting.name}" have answered. Review the meeting here ${process.env.SMTP_URI}/meetings/view/${meeting._id} .`,
      email: `<h1>All your invitees to "${meeting.name}" have answered</h1><br>Review the meeting <a href="${process.env.SMTP_URI}/meetings/view${meeting._id}">here</a>.`
    }

    this.sendMail(message);
  }
}


