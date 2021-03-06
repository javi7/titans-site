var nodemailer = require('nodemailer');

module.exports = function() {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.gmail_user,
      pass: process.env.gmail_pass
    }
  });
  return {
    sendVerificationEmail: function(user, cb) {
      var mailOptions = {
        from: 'Javi <javi.muhrer@gmail.com>',
        to: user.email,
        subject: 'Trail Titans welcomes you!',
        text: 'Verify your account by visiting http://localhost:3000/verifyEmail?thepudding=' + user.emailVerifyToken,
        html: 'Verify your account by clicking <a href="http://localhost:3000/verifyEmail?thepudding=' + user.emailVerifyToken + '">here</a>' 
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
          cb(error, false);
        } else {
          cb(null, true);
        }
      });
    },
    sendResetPasswordEmail: function(user, cb) {
      var mailOptions = {
        from: 'Javi <javi.muhrer@gmail.com>',
        to: user.email,
        subject: 'Trail Titans account information',
        text: 'To reset your password, visit http://localhost:3000/resetPassword?thepudding=' + user.resetPasswordToken,
        html: 'To reset your password, click <a href="http://localhost:3000/resetPassword?thepudding=' + user.resetPasswordToken + '">here</a>'
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          cb(error, false);
        } else {
          cb(info.response, true);
        }
      });
    },
    sendTitanApplicationReceivedEmail: function(user, cb) {
      var mailOptions = {
        from: 'Michael <michaelgrantware@gmail.com>',
        to: user.email,
        replyTo: 'michaelgrantware@gmail.com',
        subject: 'Welcome to Trail Titans',
        text: "Hey there,\r\nThanks for your interest in becoming a Titan. We got your info and will respond shortly. If you're a good fit, then we look forward to lots of climbing. If not, hopefully we can grab a beer or a movie in the park. Either way, we’ll circle back soon.\r\nCheers,\r\nMichael, Co-Founder & Resident Mountain Man",
        html: "Hey there,<br />Thanks for your interest in becoming a Titan. We got your info and will respond shortly. If you're a good fit, then we look forward to lots of climbing. If not, hopefully we can grab a beer or a movie in the park. Either way, we’ll circle back soon.<br />Cheers,<br />Michael, Co-Founder & Resident Mountain Man"
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          cb(error, false);
        } else {
          cb(null, true);
        }
      });
    },
    sendTitanApplicationToMike: function(application, cb) {
      var mtnGuideString = application.climbingGuide == 'yes' ? 'IS a climbing guide' : 'IS NOT a climbing guide';
      var mailOptions = {
        from: 'Our Computer Overlords',
        to: ['michaelgrantware@gmail.com', 'javi.muhrer@gmail.com'],
        subject: 'Trail Titans NEW TITAN APPLICATION RECEIVED - ' + application.firstName + ' ' + application.lastName,
        text: application.firstName +  ' ' + application.lastName + '\r\n' + application.email + '\r\n' + application.city + '\r\n' + application.country + '\r\nfavorite mountain: ' + application.favoriteMountain + '\r\n' + mtnGuideString + '\r\nextra info: ' + application.extraComments 
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          cb(error, false);
        } else {
          cb(null, true);
        }
      });
    },
    sendFeedbackReceivedEmail: function(user, cb) {
      var mailOptions = {
        from: 'Michael <michaelgrantware@gmail.com>',
        to: user.email,
        replyTo: 'michaelgrantware@gmail.com',
        subject: 'Thanks from Trail Titans',
        text: "Hola,\r\nThanks for dropping me a line. Although this is an automated response, my follow up email won't be. I’m co-founder of Trail Titans and I read and respond to everything that comes my way. Your feedback is right up there with my morning espresso (and that's really really important) so expect to hear from me very soon.\r\n\r\nMichael",
        html: "Hola,<br />Thanks for dropping me a line. Although this is an automated response, my follow up email won't be. I’m co-founder of Trail Titans and I read and respond to everything that comes my way. Your feedback is right up there with my morning espresso (and that's really really important) so expect to hear from me very soon.<br /><br />Michael"
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          cb(error, false);
        } else {
          cb(null, true);
        }
      });
    },
    sendNewSubscriptionEmail: function(user, cb) {
      var mailOptions = {
        from: 'Javi <javi.muhrer@gmail.com>',
        to: user.email,
        replyTo: 'javi.muhrer@gmail.com',
        subject: 'Thank you for subscribing to Trail Titans',
        text: "Hey there,\r\nThanks for subscribing.  Going forward, we’ll update you each time a new mountain becomes available. No spam, pinkie swear. Happy climbing!\r\n\r\nJavi, Co-Founder & Bit Jockey",
        html: "Hey there,<br />Thanks for subscribing.  Going forward, we’ll update you each time a new mountain becomes available. No spam, pinkie swear. Happy climbing!<br /><br />Javi, Co-Founder & Bit Jockey"
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          cb(error, false);
        } else {
          cb(null, true);
        }
      });
    },
    forwardNewSubscriptionAlert: function(user, cb) {
      var mailOptions = {
        from: 'Our Computer Overlords',
        to: ['michaelgrantware@gmail.com', 'javi.muhrer@gmail.com'],
        subject: 'Trail Titans NEW SUBSCRIBER - ' + user.email,
        text: user.email + ' has subscribed!'
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          cb(error, false);
        } else {
          cb(null, true);
        }
      });
    },
    sendFeedbackToBrainTrust: function(feedback, cb) {
      var mailOptions = {
        from: 'our idiot users',
        to: ['javi.muhrer@gmail.com', 'michaelgrantware@gmail.com'],
        subject: 'Trail Titans Feedback from our loyal fans',
        text: 'name: ' + feedback.name + '\r\nemail: ' + feedback.email + '\r\nmessage: ' + feedback.message,
        html: 'name: ' + feedback.name + '<br />email: ' + feedback.email + '<br />message: ' + feedback.message
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          cb(error, false);
        } else {
          cb(null, true);
        }
      });
    }
  };
}