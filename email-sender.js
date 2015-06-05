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
        from: 'Javi <javi@trailtitans.com>',
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
        from: 'Javi <javi@trailtitans.com>',
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
        from: 'Michael <michael@trailtitans.com>',
        to: user.email,
        replyTo: 'michael@trailtitans.com'
        subject: 'Welcome to Trail Titans ',
        text: "Hey there,\r\nThanks for your interest in becoming a Titan. We got your info and will respond shortly. If you're a good fit, then we look forward to lots of climbing. If not, hopefully we can grab a beer or a movie in the park. Either way, we’ll circle back soon.
              \r\nCheers,
              \r\nMichael, Co-Founder & Resident Mountain Man"
        html: "Hey there,<br />Thanks for your interest in becoming a Titan. We got your info and will respond shortly. If you're a good fit, then we look forward to lots of climbing. If not, hopefully we can grab a beer or a movie in the park. Either way, we’ll circle back soon.
              <br />Cheers,
              <br />Michael, Co-Founder & Resident Mountain Man"
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
        to: ['javi@trailtitans.com', 'michael@trailtitans.com'],
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