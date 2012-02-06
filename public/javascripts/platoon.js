/*! platoon - v0.1.0 - 2/5/2012
* https://github.com/rwldrn/platoon
* Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>; Licensed MIT */

/*! platoon - v0.1.0 - 2/5/2012
* https://github.com/rwldrn/platoon
* Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>; Licensed MIT */

(function( exports ) {

var // Localize navigator for use within getUserMedia
  navigator = exports.navigator,

  // Create a reasonable getUserMedia shim that covers support for the two existing
  // getUserMedia implementations. Thanks to Mike Taylr's http://miketaylr.com/photobooth/
  // for helping to outline proper Opera support
  getUserMedia = function( callback ) {
    var getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.oGetUserMedia,
        media = navigator.oGetUserMedia ? { video: true, audio: true } : "video audio";

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

    // This unit is connected with the same
    // socket as everyone else.
    this.socket = socket;

    if ( isMe ) {

      withUserMedia = function( stream ) {
        // Attach user media stream to video container source
        this.media.src = stream;

        // When video signals that it has loadedmetadata, begin "playing"
        this.media.addEventListener( "loadedmetadata", function() {
          this.media.play();
        }.bind(this));

      }.bind(this);

      getUserMedia( withUserMedia );
    }

    // call throttled requestAnimationFrame to capture frames-to-stream
    this.throttle();
  };

  Unit.prototype.throttle = function() {
    requestAnimationFrame(function throttle() {
      // Process current frames
      this.draw();
      // Continue the event loop
      requestAnimationFrame( throttle.bind(this) );
    }.bind(this));
  };

  Unit.prototype.draw = function() {
    // Draw current video frame to the canvas
    this.context.drawImage( this.media, 0, 0, 280, 160 );

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

    // Entry point:
    //   creates new id,
    //   stores id,
    //   stores reference to socket
    //   sets up socket listeners
    //   emits "join" event to socket
    join: function( socket ) {
      var id;

      // Cheto see if an Id exists in storage...
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
    },
    // Assign Socket listeners, keeps socket event handlers consolidated
    listen: function() {

      this.socket.on( "joined", function( data ) {
        if ( !Unit.exists(data.id) ) {
          this.cache[ data.id ] = new Unit( data.id, this.socket, localStorage.getItem("id") === data.id );
        }
      }.bind(this) );


      this.socket.on( "stream", function( data ) {
        var unit = this.cache[ data.id ];

        if ( !unit && !Unit.exists(data.id) ) {
          // Any missed "joined" events need to have their unit initialized locally
          unit = this.cache[ data.id ] = new Unit( data.id, this.socket, false );
        }

        if ( localStorage.getItem("id") !== data.id ) {
          unit.media.src = data.stream;
        }
      }.bind(this));
    }
  };

  exports.Platoon = Platoon;
  exports.Unit = Unit;

} ( typeof exports === "object" && exports || this ) );
