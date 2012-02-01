/*global require:true */
var platoon = require('../lib/platoon.js');

exports['awesome'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no args': function(test) {
    test.expect(1);
    // tests here
    test.equal(platoon.awesome(), 'awesome', 'should be awesome.');
    test.done();
  }
};
