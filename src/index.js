/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * A Lambda function for handling Alexa Skill MirrorMirrorOnTheWall requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Mirror Mirror, On The Wall, find Snow White"
 *  Alexa: "Showing images of Snow White"
 */

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.12001a25-5faa-4651-84dc-cd584a1c5ffa"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var MirrorMirror = require('./MirrorMirror');
MirrorMirror.setup();

var GoogleImages = require('google-images');
var cse = require("./certs/cse.json")
var googleImages = new GoogleImages(cse.ID, cse.API_key)


/**
 * MirrorMirrorSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var MirrorMirrorSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
MirrorMirrorSkill.prototype = Object.create(AlexaSkill.prototype);
MirrorMirrorSkill.prototype.constructor = MirrorMirrorSkill;

MirrorMirrorSkill.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
    console.log("MirrorMirrorSkill onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

MirrorMirrorSkill.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log("MirrorMirrorSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Alexa Skills Kit, you can say hello";
    var repromptText = "You can say hello";
    response.ask(speechOutput, repromptText);
};

MirrorMirrorSkill.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest, session) {
    console.log("MirrorMirrorSkill onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

MirrorMirrorSkill.prototype.intentHandlers = {
    // register custom intent handlers
    "MirrorMirrorHelloIntent": function(intent, session, response) {
        response.tell("Hello my queen!");
    },
    "AMAZON.HelpIntent": function(intent, session, response) {
        response.ask("You can say hello to me!", "You can say hello to me!");
    },
    "AMAZON.StopIntent": function(intent, session, response) {
        response.tell("Stopped");
    },
    "ShowTextIntent": function(intent, session, response) {
        var displayText = intent.slots.displayText.value;
        var speechOutput = "Yes, my queen, " + displayText;

        // Send publish attempt to AWS IoT
        MirrorMirror.displayText(displayText, response, speechOutput);
    },
    "ShowImagesIntent": function(intent, session, response) {
        var searchTerm = intent.slots.searchTerm.value;
        var speechOutput = "Yes, my queen, showing images of " + searchTerm;

        // Search for images
        googleImages.search(searchTerm).then(function(images) {
            // Connect to AWS IoT & Send images
            MirrorMirror.showImages(images, searchTerm, response, speechOutput);
        })
    },
    "TurnOnModuleIntent": function(intent, session, response) {
        var moduleName = intent.slots.moduleName.value;
        var speechOutput = "Yes, my queen, opening " + moduleName;

        // Send publish attempt to AWS IoT
        MirrorMirror.changeModule(moduleName, true, response, speechOutput);
    },
    "TurnOffModuleIntent": function(intent, session, response) {
        var moduleName = intent.slots.moduleName.value;
        var speechOutput = "Yes, my queen, closing " + moduleName;

        // Send publish attempt to AWS IoT
        MirrorMirror.changeModule(moduleName, false, response, speechOutput);
    }

};

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
    // Create an instance of the MirrorMirrorSkill skill.
    var mirrorMirrorSkill = new MirrorMirrorSkill();
    mirrorMirrorSkill.execute(event, context);
};