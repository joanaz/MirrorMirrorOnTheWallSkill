var awsIot = require('aws-iot-device-sdk');

var app = {}

app.TOPIC_IMAGES = "MagicMirror:new-images"
app.TOPIC_TEXT = "MagicMirror:new-text"
app.TOPIC_MODULE = "MagicMirror:change-module"
app.TOPIC_VIDEO = "MagicMirror:new-video"
app.TOPIC_PICTURE = "MagicMirror:try-on"


app.setup = function() {
  app.device = awsIot.device({
    keyPath: __dirname + "/certs/SmartMirror.private.key",
    certPath: __dirname + "/certs/SmartMirror.cert.pem",
    caPath: __dirname + "/certs/root-CA.crt",
    host: "YOURHOSTHERE",
  });
}

// Method that will accept a text and publish to AWS IoT
app.displayText = function(text, callback) {
  var update = {
    "displayText": text
  };
  app.device.publish(app.TOPIC_TEXT, JSON.stringify(update), function() {
    app.device.end();
    return callback();
  });
}

// Method that will accept an array of images and publish to AWS IoT
app.showImages = function(images, searchTerm, callback) {
  var update = {
    "images": images,
    "displayText": searchTerm,
  };

  app.device.publish(app.TOPIC_IMAGES, JSON.stringify(update), function() {
    app.device.end();
    return callback(); 
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
    app.device.end();
    return callback()
  });
}

app.takePicture = function() {
  var update = {
    "takePicture": true,
  };

  app.device.publish(app.TOPIC_PICTURE, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_PICTURE + "Data => " + JSON.stringify(update));
    app.device.end();
    return;
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
    app.device.end();
    return callback()
  });
}

module.exports = app

