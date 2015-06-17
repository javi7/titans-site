var mongoose = require('mongoose'),
  findOrCreate = require('mongoose-findorcreate'),
  bcrypt = require('bcrypt'),
  crypto = require('crypto'),
  emailSender = require('../email-sender')();

var schema = new mongoose.Schema({
  authType: String, 
  oauthId: Number,
  avatarUrl: String,
  email: {type: String, unique: true, required: true},
  hashedPassword: String,
  emailVerified: {type: Boolean, default: true},
  emailVerifyToken: String,
  emailVerifyExpiration: Date,
  resetPasswordToken: String,
  resetPasswordExpriation: Date,
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  city:  {type: String, required: true},
  state: String,
  country: {type: String, required: true},
  favoriteMountain: String,
  climbingGuide: {type: Boolean, required: true},
  extraComments: String
});

schema.methods = {
  checkPassword: function(password, cb) {
    bcrypt.compare(password, this.hashedPassword, function(err, res) {
      cb(err, res);
    });
  },
  updatePassword: function(newPassword, cb) {
    var user = this;
    bcrypt.hash(newPassword, 8, function(err, hash) {
      if (err) {
        cb(err, false);
      } else {
        user.hashedPassword = hash;
        user.save(function(err) {
          if (err) {
            cb(err, false);
          } else {
            cb(null, true);
          }
        });
      }
    });
  },
  updateEmail: function(newEmail, cb) {
    var user = this;
    user.email = newEmail;
    user.emailVerified = false;
    user.emailVerifyExpiration = getExpirationDate(24);
    crypto.randomBytes(48, function(ex, buf) {
      user.emailVerifyToken = buf.toString('hex');
      user.save(function(err) {
        if (err) {
          cb(err, false);
        }
        emailSender.sendVerificationEmail(user, function(err, result) {
          if (!result) {
            console.log('ERROR SENDING EMAIL: ' + err);
          }
          cb(err, result);
        });  
      })
    });
  }
}

schema.statics = {
  generateResetPasswordToken: function(email, cb) {
    User.findOne({'email': email}, function(err, user) {
      if (err) {
        cb(err, false, null);
      } else if (!user) {
        cb('no user with that email address', false, null);
      } else {
        crypto.randomBytes(48, function(ex, buf) {
          user.resetPasswordToken = buf.toString('hex');
          user.resetPasswordExpriation = getExpirationDate(24);
          user.save(function(err) {
            if (err) {
              cb(err, false, null);
            } else {
              cb(null, true, user);
            }
          });
        });
      }
    });
  },
  verifyEmail: function(verifyToken, cb) {
    console.log(verifyToken);
    User.findOne({'emailVerifyToken': verifyToken}, function(err, user) {
      console.log(user);
      if (err) {
        cb(err, false);
      } else if (!user) {
        cb('no user found', false);
      } else if (user.emailVerified === true) {
        cb('user email already verified', false);
      } else if (new Date() > user.emailVerifyExpiration) {
        cb('token expired', false);
      } else {
        user.emailVerified = true;
        delete user.emailVerifyToken;
        delete user.emailVerifyExpiration;
        user.save(function(err) {
          if (err) {
            cb(err, false);
          } else {
            cb(null, true);
          }
        })
      }
    });
  },
  createNewUser: function(preHashedUser, cb) {
    preHashedUser.authType = 'Local';
    preHashedUser.oauthId = -1;
    var newUser = new User(preHashedUser);
    newUser.updatePassword(preHashedUser.password, function(err, result) {
      if (err) {
        cb(err, false);
      } else if (!result) {
        cb('unknown error', result);
      } else {
        newUser.updateEmail(newUser.email, function(err, result) {
          if (err) {
            cb(err, false);
          } else {
            cb(err, result);
          }
        });
      }
    });
  },
  createTitanApplication: function(titanApp, cb) {
    titanApp.climbingGuide = titanApp.climbingGuide == 'yes';
    var newUser = new User(titanApp);
    newUser.save(function(err) {
      if (err) {
        cb(err, false);
        console.log('error creating new titan application -- ' + err);
      } else {
        cb(null, true);
      }
    });
  },
  setNewPassword: function(userId, newPassword, cb) {
    User.findById(userId, function(err, user) {
      if (err) {
        cb(err, false);
      } else if (!user) {
        cb('no user found', false);
      } else {
        user.updatePassword(newPassword, function(err, result) {
          if (err) {
            cb(err, false);
          } else if (result) {
            delete user.resetPasswordToken;
            delete user.resetPasswordExpriation;
          }
          cb(null, result);
        });
      }
    });
  }
}

var getExpirationDate = function(hours) {
  var now = new Date();
  return new Date().setTime(now.getTime() + 1000 * 60 * 60 * hours);
};

schema.plugin(findOrCreate);

module.exports = User = mongoose.model('User', schema);