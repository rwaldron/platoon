/*global require:true, exports:true */

var app = require("../lib/platoon.js"),
    Platoon = app.Platoon,
    Unit = app.Unit;


console.log( Platoon, Unit );

exports["Platoon"] = {
  "Platoon.join()": function(test) {
    test.expect(4);
    // tests here
    test.equal(typeof Platoon.join, "function", "Platoon.join() is a function");
    test.equal(typeof Platoon.listen, "function", "Platoon.listen() is a function");
    test.equal(typeof Platoon.cache, "object", "Platoon.cache is an object");
    test.equal(typeof Platoon.socket, "object", "Platoon.socket is an object(null)");
    test.done();
  }
};


exports["Unit"] = {
  "Unit.id()": function(test) {
    test.expect(2);
    // tests here
    test.equal(typeof Unit.id, "function", "Unit.id() is a function");
    test.equal(Unit.id().length, 36, "Unit.id() returns a 36 character id");
    test.done();
  },
  "Unit.fixture()": function(test) {
    test.expect(2);
    // tests here
    test.equal(typeof Unit.fixture, "function", "Unit.fixture() is a function");

    // This is a weird/dumb test, but I'm too tired to write qunit tests right now
    try {
      Unit.fixture("img", 1);
    } catch(e) {
      test.equal(e.toString(), "ReferenceError: document is not defined", "Unit.fixture() will attempt to call document methods");
    }
    // test.equal(Unit.id().length, 36, "Unit.id() returns a 36 character id");
    test.done();
  }
};
