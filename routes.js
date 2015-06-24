var User = require('./models/User'),
    emailSender = require('./email-sender')(),
    Subscriber = require('./models/Subscriber'),
    Mountain = require('./models/Mountain'),
    mountainInfo = require('./models/mountain-info'),
    cacheBusters = require('./models/cache-busters'),
    fs = require('fs');

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
  apply: function(req, res) {
    User.createTitanApplication(req.body, function(err, result) {
      if (err) {
        if (err.message.indexOf('duplicate key') > -1) {
          res.status(409).send('already applied');
        } else {
          res.status(500).send(err);
        }
      } else {
        res.status(201).send('successfully applied');
        emailSender.sendTitanApplicationReceivedEmail(req.body, function(err, result) {
          if (err || !result) {
            console.log('failed to send titan application received email: ' + req.body);
          }
        });
        emailSender.sendTitanApplicationToMike(req.body, function(err, result) {
          if (err || !result) {
            console.log('failed to forward titan application: ' + req.body);
          }
        });
      }
    });
  },
  feedback: function(req, res) {
    if (req.body.message) {
      res.status(201).send('feedback submitted');
      emailSender.sendFeedbackToBrainTrust(req.body, function(err, result) {
        if (err || !result) {
          console.log('failed to send feedback: ' + req.body);
        }
      });
      emailSender.sendFeedbackReceivedEmail(req.body, function(err, result) {
        if (err || !result) {
          console.log('failed to send feedback response: ' + req.body);
        }
      });
    } else {
      res.status(422).send('no message');
    }
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
  subscribe: function(req, res) {
    Subscriber.create({email: req.body.email}, function(err, subscriber) {
      if (err) {
        if (err.message.indexOf('duplicate key') > -1) {
          res.status(409).send('already subscribed');
        } else {
          res.status(500).send(err);
        }
      } else {
        res.status(201).send('successfully subscribed');
        emailSender.sendNewSubscriptionEmail(req.body, function(err, result) {
          if (err || !result) {
            console.log('failed to send new subscription email: ' + req.body);
          }
        });
        emailSender.forwardNewSubscriptionAlert(req.body, function(err, result) {
          if (err || !result) {
            console.log('failed to forward new subscription alert: ' + req.body);
          }
        });
      }
    });
  },
  climb: function(req, res) {
    if (mountainInfo[req.params.mountain] && (req.params.mountain in ['buriedtreasure', 'cabezadecondor'] || process.env.NODE_ENV != 'production')) {
      fs.readFile('./public/js/krpano.js', 'utf8', function (err, data) {
        var krpanojs = null;
        if (!err) {
          krpanojs = data;
        }
        res.render('climb', {
          layout: false, 
          'mountainInfo': mountainInfo[req.params.mountain], 
          'krpanojs': krpanojs,
          'cacheBusters': cacheBusters[req.params.mountain],
          'dev': process.env.NODE_ENV == 'dev'
        });
      });
    } else {
      res.status(400).send('invalid mountain name');
    }
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