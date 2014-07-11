var vows = require('vows');
var assert = require('assert');
var util = require('util');
var RunKeeperStrategy = require('passport-elance/strategy');


vows.describe('ElanceStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new ElanceStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },
    
    'should be named elance': function (strategy) {
      assert.equal(strategy.name, 'elance');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new ElanceStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = '{ \
        "userId":"4124672", \
        "userName": "t_mosby",, \
        "businessName": "Ted Mosby", \
        "companyUserId": null, \
        "companyLoginName": null, \
        "companyBusinessName": null, \
        "tagLine": "Professional PHP Development", \
        "hourlyRate": "33", \
        "isIndividual": true, \
        "isWatched": false, \
        "isStaff": false, \
        "city": "Seattle", \
        "state": "WA" \
        }';
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'elance');
        assert.equal(profile.id, '4124672');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new ElanceStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);
