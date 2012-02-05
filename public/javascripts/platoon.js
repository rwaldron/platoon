/*! platoon - v0.1.0 - 2/5/2012
* https://github.com/rwldrn/platoon
* Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>; Licensed MIT */

(function( exports ) {

var // Normalization
  navigator = exports.navigator,

  getUserMedia = navigator &&
    ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.oGetUserMedia ),

  // Localization of global resources
  socket = exports.io.connect(),

  // Program initializers
  Platoon, Unit;


  // Program
  Platoon = {};

  Unit = function() {
    this.id = Unit.id();
    this.canvas = Unit.fixture( "canvas", this.id );
    this.video = Unit.fixture( "video", this.id );

    this.context = this.canvas.getContext("2d");
  };
  // Static Unit functions

  Unit.id = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function( chr ) {
      var rnd = Math.random() * 16 | 0;
      return ( chr === "x" ? rnd : (rnd & 0x3 | 0x8) ).toString( 16 );
    }).toUpperCase();
  };

  Unit.fixture = function( nodeName, id ) {
    var node = document.createElement( nodeName );
    node.id = nodeName[0] + "_" + id;

    node.style.width = "320px";
    node.style.height = "240px";

    // TODO: make this definable
    document.body.appendChild(node);

    return node;
  };


  Platoon.cache = {};

  //
  // Platoon.join = function() {
  //   var id = Platoon.id();
  //   return (Platoon.cache[ id ] = new Unit( id )).id;
  // };


  // canvas#capture(width='320', height='240', hidden)
  // img#receive(width='320', height='240')
  // video#monitor(width='160', height='120', autoplay)



  // Entry point:
  //   creates new id,
  //   stores id,
  //   emits "join" event to socket
  Platoon.join = function() {
    // Generate id for for newly joined unit
    var id = Unit.id();

    // Stores id locally to keep
    localStorage.setItem( "id", id );

    socket.emit( "join", {
      id: id
    });
  };

  // Socket event handlers
  socket.on( "joined", function( data ) {

    console.log( data );
    //receive.src = data;
  });

  exports.Platoon = Platoon;

} ( typeof exports === "object" && exports || this ) );
