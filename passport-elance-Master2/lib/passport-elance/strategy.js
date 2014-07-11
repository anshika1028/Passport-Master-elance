/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The elance authentication strategy authenticates requests by delegating to
 * elance using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your elance application's client id
 *   - `clientSecret`  your elance application's client secret
 *   - `callbackURL`   URL to which RunKeeper will redirect the user after granting authorization
 *
 * 
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://api.elance.com/api2/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://api.elance.com/api2/oauth/token';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'elance';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from RunKeeper.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `runkeeper`
 *   - `id`               the user's RunKeeper ID
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get('https://api.elance.com/api2/profiles/my?access_token=', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    
    try {
      var json = JSON.parse(body);
      
      var profile = { provider: 'elance' };
      profile.id = json.userId;
      
      // TODO: /profile can be fetched to obtain additional profile details.
       
      profile._raw = body;
      profile._json = json;
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
