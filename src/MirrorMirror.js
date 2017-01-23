var awsIot = require('aws-iot-device-sdk');

var app = {}

app.TOPIC_IMAGES = "MagicMirror:new-images"
app.TOPIC_TEXT = "MagicMirror:new-text"
app.TOPIC_MODULE = "MagicMirror:change-module"


app.setup = function() {
  app.device = awsIot.device({
    keyPath: __dirname + "/certs/MagicMirror.private.key",
    certPath: __dirname + "/certs/MagicMirror.cert.pem",
    caPath: __dirname + "/certs/root-CA.crt",
    clientId: "MirrorMirror" + (new Date().getTime()),
    region: "us-east-1",
    host: "a1vxvxbj3djyge.iot.us-east-1.amazonaws.com"
  });

  app.device.on('connect', function() {
    console.log('connect');
  });

  app.device.on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });
}

// Method that will accept an array of images and publish to AWS IoT
app.showImages = function(images, searchTerm, response, speechOutput) {
  var searchTerm = searchTerm || null;
  var imageList = images || [];
  var update = {
    "images": imageList,
    "displayText": searchTerm,
  };

  // validate?
  if (!imageList.length) return;

  app.device.publish(app.TOPIC_IMAGES, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_IMAGES + "Data => " + JSON.stringify(update));
    response.ask.call(response, speechOutput)
  });
}

// Method that will accept an array of images and publish to AWS IoT
app.displayText = function(text, response, speechOutput) {
  var displayText = text || "Oops. I missed it. Try again.";
  var update = {
    "displayText": displayText,
  };

  app.device.publish(app.TOPIC_TEXT, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_TEXT + "Data => " + JSON.stringify(update));
    response.ask.call(response, speechOutput)
  });
}

// Method that will accept an array of images and publish to AWS IoT
app.changeModule = function(text, turnOn, response, speechOutput) {
  var moduleName = text || "Oops. I missed it. Try again.";
  var update = {
    "moduleName": moduleName,
    "turnOn": turnOn,
  };

  app.device.publish(app.TOPIC_MODULE, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_MODULE + "Data => " + JSON.stringify(update));
    response.ask.call(response, speechOutput)
  });
}


module.exports = app