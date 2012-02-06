var express = require("express"),
    socket = require("socket.io");

var app = express.createServer(),
    io = socket.listen( app );

// Express app Configuration
app.configure(function() {
  // Uses Express defaults
  app.set( "views", __dirname + "/views" );
  app.set( "view engine", "jade" );
  app.use( express.bodyParser() );
  app.use( express.methodOverride() );
  app.use( app.router );
  app.use( express.static(__dirname + "/public") );
});

// Routes
app.get( "/", function( req, res ) {
  res.render( "index", {
    title: "Platoon"
  });
});

// Connection Pool
var connections = {
  // uid: object
};

io.set( "log level", 1 );
// When socket is connected, initialize new unit in platoon,
// begin relay of WebRTC captures
io.sockets.on( "connection", function( client ) {

  // Receive "join" events for new units,
  // dispatch "joined" with any instructions
  client.on( "join", function( data ) {
    // Contains a connection uid to add to the pool
    // console.log( data );

    connections[ data.id ] = true;

    // Emit "joined" notice to all other connections,
    // Will create new unit and output canvas
    io.sockets.emit( "joined", data );
  });

  client.on( "stream", function( data ) {
    io.sockets.emit( "stream", data );
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
