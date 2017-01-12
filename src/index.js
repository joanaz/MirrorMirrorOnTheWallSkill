/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Hello World to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var MirrorMirror = require('./MirrorMirror')

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
    "MirrorMirrorSkillIntent": function(intent, session, response) {
        response.tellWithCard("Hello my queen!", "Hello", "You are the fairest of them all!");
    },
    "AMAZON.HelpIntent": function(intent, session, response) {
        response.ask("You can say hello to me!", "You can say hello to me!");
    },
    "ShowTextIntent": function(intent, session, response) {
        var cardTitle = "Mirror Mirror - Say Something";
        var displayText = intent.slots.displayText.value;
        var speechOutput = "Yes, my queen " + displayText;

        MirrorMirror.setup(function() {
            // Send publish attempt to AWS IoT
            MirrorMirror.displayText(displayText);

            // Done
            response.tellWithCard(speechOutput, cardTitle, displayText);

        });
    },
    "ShowImagesIntent": function(intent, session, response) {
        var cardTitle = "Magic Mirror - Show Me Something";
        var searchTerm = intent.slots.searchTerm.value;
        var speechOutput = "I told your mirror to show you images of " + searchTerm;

        // Search for images
        googleImages.search(searchTerm, function(err, images) {
            console.log("Found images: " + JSON.stringify(images));

            // Connect to AWS IoT
            MirrorMirror.setup(function(clientToken) {

                // Send images
                MirrorMirror.showImages(images, searchTerm);

                // Done
                response.tellWithCard(speechOutput, cardTitle, searchTerm);

            });
        });
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
    // Create an instance of the MirrorMirrorSkill skill.
    var MirrorMirrorSkill = new MirrorMirrorSkill();
    MirrorMirrorSkill.execute(event, context);
};