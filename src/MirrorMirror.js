var awsIot = require('aws-iot-device-sdk');

var app = {
  TOPIC_IMAGES: "MagicMirror:new-images",
  TOPIC_TEXT: "MagicMirror:new-text"
}

app.setup = function(callback) {
  app.device = awsIot.device({
    keyPath: "./certs/9bb009c929-private.pem.key",
    certPath: "./certs/9bb009c929-certificate.pem.crt",
    caPath: "./certs/rootCA.pem.crt",
    clientId: "MagicMirror" + (new Date().getTime()),
    region: "us-east-1"
  });


  app.device.on('connect', function() {
    console.log('connect');

    callback()
  });

  app.device.on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });
}

// Method that will accept an array of images and publish to AWS IoT
app.showImages = function(images, searchTerm, callback) {
  var callback = callback || function() {};
  var searchTerm = searchTerm || null;
  var imageList = images || [];
  var timestamp = new Date().getTime();
  var update = {
    "images": imageList,
    "displayText": searchTerm,
    timestamp: timestamp
  };

  // validate?
  if (!imageList.length) return;

  app.device.publish(app.TOPIC_IMAGES, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_IMAGES + "Data => " + JSON.stringify(update));
    callback();
  });
}

// Method that will accept an array of images and publish to AWS IoT
app.displayText = function(text, callback) {
  var callback = callback || function() {};
  var displayText = text || "Oops. I missed it. Try again.";
  var timestamp = new Date().getTime();
  var update = {
    "displayText": displayText,
    timestamp: timestamp
  };

  app.device.publish(app.TOPIC_TEXT, JSON.stringify(update), function() {
    console.log("Published: \nTopic => " + app.TOPIC_TEXT + "Data => " + JSON.stringify(update));
    callback();
  });
}

module.exports = app