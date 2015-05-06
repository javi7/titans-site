var passport = require('passport'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  exphbs = require('express-handlebars'),
  FacebookStrategy = require('passport-facebook').Strategy,
  GoogleStrategy = require('passport-google-openidconnect').Strategy,
  LocalStrategy = require('passport-local').Strategy
  express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  https = require('https'),
  User = require('./models/User'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  fs = require('fs');

var app = express();
var port = process.env.PORT || 3000;

var loggedIn = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/');
  }
}

mongoose.connect('mongodb://localhost/trail-titans');

app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(session({secret: 'javijavijavi', store: new MongoStore({ mongooseConnection: mongoose.connection }), resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: false, type: 'application/x-www-form-urlencoded' }));
app.use(express.static('public'));

app.get('', routes.index);
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/' }));
app.get('/auth/google/callback', 
  passport.authenticate('google-openidconnect', { successRedirect: '/',
                                    failureRedirect: '/' }));

app.get('/auth/google', passport.authenticate('google-openidconnect'));
app.get('/logout', routes.logout);
app.post('/register', routes.register);
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/' })
);

app.get('/verifyEmail', routes.verifyEmail);
app.get('/resetPasswordRequest', routes.resetPasswordRequest);
app.post('/resetPasswordRequest', routes.resetPasswordRequestPost);
app.get('/resetPassword', routes.resetPasswordPage);
app.post('/resetPassword', routes.resetPasswordPost);
app.get('/account', loggedIn, routes.accountPage);
app.post('/updatePassword', routes.updatePassword);
app.post('/updateEmail', routes.updateEmail);
app.post('/updateBio', routes.updateBio);

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user); 
  });
});

passport.use(
  new FacebookStrategy({
    clientID: 817521254997988,
    clientSecret: 'b352bac698b966cdb861ca6d06ce2ba3',
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos']
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(
      {authType: 'Facebook', oauthId: profile .id},
      {name: profile._json.name, avatarUrl: profile._json.picture.data.url}, 
      function(err, user, created) {
        done(err, user);
      }
    );
  }
));

passport.use(new GoogleStrategy({
    clientID: '390985003318-109t6a5j51l7vaigo2lb3r8n79junder.apps.googleusercontent.com',
    clientSecret: 'Uk_h9XJDJEAQM3puGOvAjkkL',
    callbackURL: "http://localhost:3000/auth/google/callback",
    profileFields: ['id', 'displayName', 'photos']
  },
  function(iss, sub, profile, accessToken, refreshToken, done) {
    console.log(profile);
    User.findOrCreate(
      {authType: 'Google', oauthId: profile.id},
      {name: profile._json.name, avatarUrl: profile._json.picture},
      function(err, user, created) {
        done(err, user);
      }
    );
  }
));

passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  function(email, password, done) {
    console.log(email + ' -- ' + password);
    User.findOne({ email: email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      } else if (!user.emailVerified) {
        return done(null, false, { message: 'User has not verified email'});
      }
      user.checkPassword(password, function(err, res) {
        console.log(password + ' -- ' + email + ' -- ' + err + ' -- ' + res);
        if (res) {
          return done(err, user);
        } else {
          return done(err, false, { message: 'Incorrect password.' });
        }
      });
    });
  }
));

var options = {
  key: fs.readFileSync('config/ssl/key.pem'),
  cert: fs.readFileSync('config/ssl/cert.pem')
};

http.createServer(app).listen(port);
https.createServer(options, app).listen(443);
