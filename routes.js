var User = require('./models/User'),
    emailSender = require('./email-sender')(),
    Subscriber = require('./models/Subscriber'),
    Mountain = require('./models/Mountain');

module.exports = {
  index: function(req, res) {
    console.log(req.user);
    res.render('home', {'user': req.user});
  },
  register: function(req, res) {
    User.createNewUser(req.body, function(err, result) {
      if (err) {
        res.status(400).send(err);
      } else if (!result) {
        res.status(400).send('unknown error!');
      } else {
        res.redirect('/');
      }
    });
  },
  logout: function(req, res){
    req.logout();
    res.redirect('/');
  },
  verifyEmail: function(req, res) {
    User.verifyEmail(req.query.thepudding, function(err, result) {
      if (result) {
        res.redirect('/');
      } else {
        res.status(400).send(err);
      }
    });
  }, 
  resetPasswordRequest: function(req, res) {
    res.render('resetPasswordRequest');
  },
  resetPasswordRequestPost: function(req, res) {
    User.generateResetPasswordToken(req.body.email, function(err, result, user) {
      if (err) {
        res.status(400).send(err);
      } else if (!result) {
        res.status(400).send('unknown error');
      } else {
        emailSender.sendResetPasswordEmail(user, function(info, success) {
          if (!success) {
            console.log('ERROR SENDING EMAIL: ' + info);
          }
        })
        res.redirect('/');
      }
    });
  },
  resetPasswordPage: function(req, res) {
    User.findOne({'resetPasswordToken': req.query.thepudding}, function(err, user) {
      if (user && user.resetPasswordExpriation > new Date()) {
        req.session.userResettingPassword = user._id;
        res.render('resetPassword');
      } else {
        res.status(400).send('invalid reset token');
      }
    });
  },
  resetPasswordPost: function(req, res) {
    User.setNewPassword(req.session.userResettingPassword, req.body.password, function(err, result) {
      delete req.session.userResettingPassword;
      if (err) {
        res.status(400).send(err);
      } else if (!result) {
        res.status(400).send('unknown error');
      } else {
        res.redirect('/');
      }
    });
  },
  accountPage: function(req, res) {
    res.render('account', {'user': req.user});
  },
  updatePassword: function(req, res) {
    req.user.updatePassword(req.body.password, handleError('/account', res));
  },
  updateEmail: function(req, res) {
    req.user.updateEmail(req.body.email, handleError('/account', res));
  },
  updateBio: function(req, res) {
    req.user.updateBio(req.body, handleError('/account', res));
  },
  subscribe: function(req, res) {
    Subscriber.create({email: req.body.email}, function(err, subscriber) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.send(subscriber.email + ' successfully subscribed for alerts!');
      }
    });
  },
  climb: function(req, res) {
    Mountain.findOne({'mountainName': req.params.mountain}, function(err, mountainInfo) {
      if (mountainInfo) {
        res.render('climb', {layout: false, 'mountainInfo': mountainInfo});
      } else {
        res.status(400).send(err);
      }
    })
  }
};

var handleError = function(successTarget, res) {
  return function(err, result) {
    if (err) {
        res.status(400).send(err);
      } else if (!result) {
        res.status(400).send('unknown error');
      } else {
        res.redirect(successTarget);
      }
  };
}