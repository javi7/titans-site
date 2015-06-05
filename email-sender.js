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
        from: 'Javi <javi@trailtitans.com>',
        to: user.email,
        subject: 'Thanks for applying to be a Titan!',
        text: 'Thanks for your interest!',
        html: 'Thanks for your interest!'
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