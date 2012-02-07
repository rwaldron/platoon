/*! platoon - v0.1.0 - 2/7/2012
* https://github.com/rwldrn/platoon
* Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>; Licensed MIT */

/*! platoon - v0.1.0 - 2/5/2012
* https://github.com/rwldrn/platoon
* Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>; Licensed MIT */

(function( exports ) {

var requestAnimationFrame, cancelAnimationFrame,
  vendors = [ "ms", "moz", "webkit", "o" ],
  prefix = "",
  postfix = "AnimationFrame";

  if ( !exports.requestAnimationFrame ) {
    while ( vendors.length ) {
      prefix = vendors.pop();

      requestAnimationFrame = exports[ prefix + "Request" + postfix ];
      cancelAnimationFrame = exports[ prefix + "Cancel" + postfix ] ||
                              exports[ prefix + "CancelRequest" + postfix ];

      if ( requestAnimationFrame ) {
        break;
      }
    }
  }

var // Localize navigator for use within getUserMedia
  navigator = exports.navigator,

  // Create a reasonable getUserMedia shim that covers support for the two existing
  // getUserMedia implementations. Thanks to Mike Taylr's http://miketaylr.com/photobooth/
  // for helping to outline proper Opera support
  getUserMedia = function( callback ) {
    var getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia,
        media = navigator.getUserMedia ? { video: true, audio: true } : "video audio";

    getMedia.call( navigator, media, function( data ) {
      var stream = window.webkitURL ? window.webkitURL.createObjectURL( data ) : data;

      callback( stream );
    });
  },

  // Program initializers
  Unit, Platoon;

  // ---- Program ---- //

  // Unit Constructor
  Unit = function( id, socket, isMe ) {
    var withUserMedia;

    this.id = id;
    this.isMe = isMe;

    // This unit's video
    this.media = isMe ? Unit.fixture( "video", this.id ) : new Image();

    // This unit's canvas, if it's anyone
    this.canvas = Unit.fixture( "canvas", this.id );
    this.context = this.canvas.getContext("2d");

    // Store datauri's received from stream
    this.dataUri = "";

    // This unit is connected with the same
    // socket as everyone else.
    this.socket = socket;

    this.isDrawing = false;

    if ( isMe ) {

      withUserMedia = function( stream ) {
        // Attach user media stream to video container source
        this.media.src = stream;

        // When video signals that it has loadedmetadata, begin "playing"
        this.media.addEventListener( "loadedmetadata", function() {
          this.media.play();
        }.bind(this), false);

        this.media.addEventListener( "timeupdate", function() {
          this.draw();
          this.broadcast();
        }.bind(this), false);

      }.bind(this);

      getUserMedia( withUserMedia );
    }
    // call throttled requestAnimationFrame to capture frames-to-stream
    // this.throttle();
  };


  Unit.prototype.throttle = function() {
    // requestAnimationFrame(function throttle() {
    //   // Process current frames
    //   this.draw();
    //   // Continue the event loop
    //   requestAnimationFrame( throttle.bind(this) );
    // }.bind(this));

    // setInterval(function() {
    //   // Process current frames
    //   this.draw();
    // }.bind(this), 1000/20 );
  };

  Unit.prototype.draw = function() {
    this.isDrawing = true;
    // Draw current video frame to the canvas
    this.context.drawImage( this.media, 0, 0, 280, 160 );

    // Reset isDrawing flag
    this.isDrawing = false;
  };

  Unit.prototype.broadcast = function() {
    // Dispatch a "stream" event to the socket
    // This will be relayed out to all other
    // units in the platoon
    if ( this.isMe ) {
      this.socket.emit( "stream", {
        id: this.id,
        stream: this.canvas.toDataURL()
      });
    }
  };

  // Static Unit functions
  // Unit.id()
  // Returns a pretty damn unique id
  Unit.id = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function( chr ) {
      var rnd = Math.random() * 16 | 0;
      return ( chr === "x" ? rnd : (rnd & 0x3 | 0x8) ).toString( 16 );
    }).toUpperCase();
  };

  // Create an HTML element fixture
  Unit.fixture = function( nodeName, id ) {
    var node = document.createElement( nodeName );
    node.id = nodeName[0] + "_" + id;

    node.style.width = "160px";
    node.style.height = "120px";

    // TODO: make this definable
    document.body.appendChild( node );

    if ( nodeName === "video" ) {
      node.style.display = "none";
    }

    return node;
  };

  Unit.exists = function( id ) {
    return !!document.querySelectorAll( "[id$='" + id + "']" ).length;
  };


  Platoon = {

    cache: {},

    socket: null,

    loop: null,

    // Entry point:
    //   creates new id,
    //   stores id,
    //   stores reference to socket
    //   sets up socket listeners
    //   emits "join" event to socket
    join: function( socket ) {
      var id;

      // Check to see if an Id exists in storage...
      id = localStorage.getItem("id");

      // If not, then generate id for for newly joined unit
      // Store id locally to keep track of repeat visitors
      if ( !id ) {
        id = Unit.id();
        localStorage.setItem( "id", id );
      }

      // Assign socket to program socket reference
      this.socket = socket;

      // Set up socket handlers
      this.listen();

      // Tell the server that I've joined
      this.socket.emit( "join", {
        id: id
      });

      // Initiate event loop for rendering "other" units
      (function throttle() {
        // Process current frames
        // this.draw();
        var keys = Object.keys( Platoon.cache );

        if ( keys.length > 1 ) {

          keys.forEach(function( key ) {
            var unit = this[ key ];

            if ( !unit.isMe && !unit.isDrawing ) {
              unit.media.src = unit.dataUri;
              unit.draw();
            }
          }, Platoon.cache );
        }

        // Continue the event loop
        //Platoon.loop = requestAnimationFrame( throttle );
        Platoon.loop = setTimeout( throttle, 1000/6 );
      }());
    },
    // Assign Socket listeners, keeps socket event handlers consolidated
    listen: function() {

      // Handle newly joined units
      this.socket.on( "joined", function( data ) {
        var id = data.id;

        if ( !Unit.exists(id) ) {
          this.cache[ id ] = new Unit( id, this.socket, localStorage.getItem("id") === id );
        }
      }.bind(this));

      // If the socket disconnects, cancel the the event loop
      this.socket.on( "disconnect", function() {
        cancelAnimationFrame( Platoon.loop );
      });

      // When recieving streams from the socket,
      // store them in the unit instance
      this.socket.on( "stream", function( data ) {
        var id = data.id,
            unit = this.cache[ id ];

        // Any missed "joined" events need to have
        // their unit initialized locally
        if ( !unit && !Unit.exists(id) ) {
          unit = this.cache[ id ] = new Unit( id, this.socket, false );
        }

        if ( localStorage.getItem("id") !== id ) {
          unit.dataUri = data.stream;
        }
      }.bind(this));
    }
  };

  exports.Platoon = Platoon;
  exports.Unit = Unit;

} (typeof exports === "object" && exports || this) );