var pmx = require('pmx');
pmx.init();
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
  fs = require('fs'),
  helmet = require('helmet'),
  validator = require('express-validator'),
  knox = require('knox'),
  mime = require('mime'),
  compression = require('compression');

var app = express();
app.use(compression());
var port = process.env.PORT || 3000;
var aws = knox.createClient({
  key: process.env.aws_key,
  secret: process.env.aws_secret,
  bucket: process.env.aws_bucket
});

var loggedIn = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/');
  }
}

mongoose.connect(process.env.mongo);

app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var sessionMiddleware = session({
  secret: 'javijavijavi',
  store: new MongoStore({ 
    mongooseConnection: mongoose.connection,
    clear_interval: 3600 
  }), 
  resave: false, 
  saveUninitialized: false,
  cookie: {httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000}
});
app.use(function(req, res, next) {
  if (req.url.indexOf('/mountain-data') === 0) {
    return next();
  } else {
    return sessionMiddleware(req, res, next);
  }
});
app.use(helmet());
app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: false, type: 'application/x-www-form-urlencoded' }));
app.use(validator());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

app.get('', routes.index);
app.get('/favicon.ico', function(req, res) {
  res.redirect('http://d39rd677qckrt3.cloudfront.net/favicon.ico');
});
app.post('/apply', routes.apply);
app.post('/feedback', routes.feedback);


// account management endpoints

// app.post('/register', routes.register);
// app.post('/login',
//   passport.authenticate('local', { successRedirect: '/',
//                                    failureRedirect: '/' })
// );
// app.get('/logout', routes.logout);
// app.get('/verifyEmail', routes.verifyEmail);
// app.get('/resetPasswordRequest', routes.resetPasswordRequest);
// app.post('/resetPasswordRequest', routes.resetPasswordRequestPost);
// app.get('/resetPassword', routes.resetPasswordPage);
// app.post('/resetPassword', routes.resetPasswordPost);
// app.get('/account', loggedIn, routes.accountPage);
// app.post('/updatePassword', routes.updatePassword);
// app.post('/updateEmail', routes.updateEmail);
// app.get('/auth/facebook', passport.authenticate('facebook'));
// app.get('/auth/facebook/callback', 
//   passport.authenticate('facebook', { successRedirect: '/',
//                                       failureRedirect: '/' }));
// app.get('/auth/google/callback', 
//   passport.authenticate('google-openidconnect', { successRedirect: '/',
//                                     failureRedirect: '/' }));

// app.get('/auth/google', passport.authenticate('google-openidconnect'));

app.post('/subscribe', routes.subscribe);
app.get('/climb/:mountain', routes.climb);

passport.serializeUser(function(user, done) {
  console.log('serializing: ' + user);
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializing: ' + id);
  User.findById(id, function(err, user) {
    done(err, user); 
  });
});

passport.use(
  new FacebookStrategy({
    clientID: process.env.facebook_clientId,
    clientSecret: process.env.facebook_clientSecret,
    callbackURL: process.env.facebook_callback,
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
    clientID: process.env.google_clientId,
    clientSecret: process.env.google_clientSecret,
    callbackURL: process.env.google_callback,
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

process.setMaxListeners(0);
app.use(pmx.expressErrorHandler());
http.createServer(app).listen(port);
