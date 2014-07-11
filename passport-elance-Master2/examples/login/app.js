var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , ElanceStrategy = require('passport-elance').Strategy;

var ELANCE_CLIENT_ID = "5334bb57e4b0b36ee5cf4a79";//"--insert-elance-client-id-here--"
var Elance_CLIENT_SECRET = "lC6OpwqaaaHamhDDIXziow";//"--insert-elance-client-secret-here--";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Elance profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the ElanceStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and RunKeeper
//   profile), and invoke a callback with a user object.
passport.use(new ElanceStrategy({
    clientID: ELANCE_CLIENT_ID,
    clientSecret: Elance_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's elance profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the RunKeeper account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user});
});
app.get('/api/me',
  function(req, res) {
    if(req.user!=null){
      res.json(req.user);
  }else{
    res.json("{'result':'Unable to find the authenticated user'}");
  }
  });
app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/elance
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in elance authentication will involve
//   redirecting the user to elance.com.  After authorization, elance
//   will redirect the user back to this application at /auth/runkeeper/callback
app.get('/auth/elance',
  passport.authenticate('elance'),
  function(req, res){
    // The request will be redirected to elance for authentication, so this
    // function will not be called.
  });

// GET /callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/callback', 
  passport.authenticate('elance', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(8080);
console.log("listen to port 8080");

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
