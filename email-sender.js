var nodemailer = require('nodemailer'),
    config = require('./config/email');

module.exports = function() {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: config
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
      })
    }
  };
}