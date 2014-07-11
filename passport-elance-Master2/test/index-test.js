var vows = require('vows');
var assert = require('assert');
var util = require('util');
var runkeeper = require('passport-elance');


vows.describe('passport-elance').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(elance.version);
    },
  },
  
}).export(module);
