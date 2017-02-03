var awsIot = require('aws-iot-device-sdk');

var app = {}

app.TOPIC_IMAGES = "MagicMirror:new-images"
app.TOPIC_TEXT = "MagicMirror:new-text"
app.TOPIC_MODULE = "MagicMirror:change-module"
app.TOPIC_VIDEO = "MagicMirror:new-video"

app.setup = function() {
  app.device = awsIot.device({
    keyPath: __dirname + "/certs/MagicMirror.private.key",
    certPath: __dirname + "/certs/MagicMirror.cert.pem",
    caPath: __dirname + "/certs/root-CA.crt",
    clientId: "MirrorMirror" + (new Date().getTime()),
    region: "us-east-1",
  });

  app.device.on('connect', function() {
    console.log('connect');
  });

  app.device.on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });
}

// Method that will accept a text and publish to AWS IoT
app.displayText = function(text, callback) {
  var update = {
    "displayText": text
  };

  app.device.publish(app.TOPIC_TEXT, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_TEXT + "Data => " + JSON.stringify(update));
    callback()
  });
}

// Method that will accept an array of images and publish to AWS IoT
app.showImages = function(images, searchTerm, callback) {
  var update = {
    "images": images,
    "displayText": searchTerm,
  };

  app.device.publish(app.TOPIC_IMAGES, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_IMAGES + "Data => " + JSON.stringify(update));
    callback()
  });
}

// Method that will accept a Magic Mirror Module name and publish to AWS IoT
app.changeModule = function(moduleName, turnOn, callback) {
  var update = {
    "moduleName": moduleName,
    "turnOn": turnOn,
  };

  app.device.publish(app.TOPIC_MODULE, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_MODULE + "Data => " + JSON.stringify(update));
    callback()
  });
}


// Method that will accept a video ID and publish to AWS IoT
app.showVideo = function(videoId, searchTerm, callback) {
  var update = {
    "videoId": videoId,
    "displayText": searchTerm,
  };

  app.device.publish(app.TOPIC_VIDEO, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_VIDEO + "Data => " + JSON.stringify(update));
    callback()
  });
}

module.exports = app