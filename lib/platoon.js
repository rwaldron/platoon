/*
 * platoon
 * https://github.com/rwldrn/platoon
 *
 * Copyright (c) 2012 Rick Waldron, Wes Bos
 * Licensed under the MIT license.
 */

(function(exports) {
  var Platoon = {},
      
      peerConnection,

      /* Request the users local media and append stream to local video element */
      requestLocalMedia = function(mediaType,el) {

        // Deal with vendor prefixes
        navigator.getUserMedia = navigator.getUserMedia ? navigator.getUserMedia : navigator.webkitGetUserMedia;
        
        // Check for webRTC support
        if (navigator.getUserMedia) {
          navigator.getUserMedia(mediaType,function(stream) {
            el.src = webkitURL.createObjectURL(stream);
          });
        }
        else {
          console.log('yall dont have a browser that supports webRTC');
        }

      },

      // Use Socket.io to send connection to the remote client
      sendToRemote = function(signal) {
        socket.emit('signal',signal);
      },
      
      signalingCallback = function(signal) {
        sendToRemote(signal);
      },

      indicateConnected = function() {
        console.log('connected!');
      },

      // Create the peer connection with the STUN/TURN configuration, set as "NONE" if working locally
      createPeerConnection = function() {
        if (!peerConnection) {
            peerConnection = new webkitPeerConnection("NONE", signalingCallback);
            peerConnection.onopen = indicateConnected();
            peerConnection.onaddstream = startShowingStream;
        }
      };

      // Expose to window
      Platoon.requestLocalMedia = requestLocalMedia;

      /**
       * Events
       */

      window.onload = function() {

        socket = io.connect('/');

        // connect local video
        var video = document.querySelector('.local');
        requestLocalMedia('video audio',video);

      };

}(typeof exports === 'object' && exports || this));