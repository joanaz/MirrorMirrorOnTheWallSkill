'use strict';
/**
 * A Lambda function for handling Alexa Skill MirrorMirrorOnTheWall requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa On The Wall, find Snow White."
 *  Alexa: "Yes my Queen, showing images of Snow White."
 */

const Alexa = require('alexa-sdk');

/**
 * App ID for the skill
 * 
 * replace with your app ID 
 */
const APP_ID = "amzn1.ask.skill.12001a25-5faa-4651-84dc-cd584a1c5ffa";

const MirrorMirror = require('./MirrorMirror');
MirrorMirror.setup();

const Keys = require("./certs/keys.json");
const GoogleImages = require('google-images');
var googleImages = new GoogleImages(Keys.cse.ID, Keys.cse.API_key);

const YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey(Keys.youtube.API_key);

exports.handler = function(event, context, callback) {
    let alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var languageStrings = {
    "en-US": {
        "translation": {
            "WELCOME_MESSAGE": "Hello my Queen, what can I do for you? ",
            "WELCOME_REPROMPT": "I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you, my Queen?",
            "CARD_TITLE": "MagicMirror: %s",
            "HELP_MESSAGE": "Hello my Queen, I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you, my Queen?",
            "STOP_MESSAGE": "See you next time, my Queen!",
            "SHOW_TEXT": "Yes, my Queen. %s.",
            "SHOW_TEXT_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'display text of hello', or 'say you are the fairest of them all'. What can I do for you, my Queen?",
            "SHOW_IMAGE": "Yes, my Queen, showing images of %s.",
            "SHOW_IMAGE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'find Snow White' or 'show me images of Bill Gates'. What can I do for you, my Queen?",
            "TURN_ON_MODULE": "Yes, my Queen, opening module %s.",
            "TURN_ON_MODULE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'open current weather' or 'turn on compliments'. What can I do for you, my Queen?",
            "TURN_OFF_MODULE": "Yes, my Queen, closing module %s.",
            "TURN_OFF_MODULE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'close current weather' or 'turn off compliments'. What can I do for you, my Queen?",
            "SHOW_VIDEO": "Yes, my Queen, showing a video of %s.",
            "SHOW_VIDEO_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'find a video of Snow White' or 'show me a video of Bill Gates'. What can I do for you, my Queen?"
        }
    },
    "en-GB": {
        "translation": {
            "WELCOME_MESSAGE": "Hello my Queen, what can I do for you? ",
            "WELCOME_REPROMPT": "I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you, my Queen?",
            "CARD_TITLE": "MagicMirror: %s",
            "HELP_MESSAGE": "Hello my Queen, I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you, my Queen?",
            "STOP_MESSAGE": "See you next time, my Queen!",
            "SHOW_TEXT": "Yes, my Queen. %s.",
            "SHOW_TEXT_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'display text of hello', or 'say you are the fairest of them all'. What can I do for you, my Queen?",
            "SHOW_IMAGE": "Yes, my Queen, showing images of %s.",
            "SHOW_IMAGE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'find Snow White' or 'show me images of Bill Gates'. What can I do for you, my Queen?",
            "TURN_ON_MODULE": "Yes, my Queen, opening module %s.",
            "TURN_ON_MODULE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'open current weather' or 'turn on compliments'. What can I do for you, my Queen?",
            "TURN_OFF_MODULE": "Yes, my Queen, closing module %s.",
            "TURN_OFF_MODULE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'close current weather' or 'turn off compliments'. What can I do for you, my Queen?",
            "SHOW_VIDEO": "Yes, my Queen, showing a video of %s.",
            "SHOW_VIDEO_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'find a video of Snow White' or 'show me a video of Bill Gates'. What can I do for you, my Queen?"
        }
    }
};

var handlers = {
    'LaunchRequest': function() {
        this.emit('SayHello');
    },
    'MirrorMirrorHelloIntent': function() {
        this.emit('SayHello');
    },
    'SayHello': function() {
        this.emit(':askWithCard', this.t("WELCOME_MESSAGE"), this.t("WELCOME_REPROMPT"), this.t("CARD_TITLE", "Hello"), this.t("WELCOME_MESSAGE") + this.t("WELCOME_REPROMPT"));
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':askWithCard', this.t("HELP_MESSAGE"), this.t("HELP_MESSAGE"), this.t("CARD_TITLE", "Help"), this.t("HELP_MESSAGE"));
    },
    'AMAZON.StopIntent': function() {
        this.emit('StopCommand');
    },
    'AMAZON.CancelIntent': function() {
        this.emit('StopCommand');
    },
    'StopCommand': function() {
        this.emit(':tellWithCard', this.t("STOP_MESSAGE"), this.t("CARD_TITLE", "Stop"), this.t("STOP_MESSAGE"));
    },
    'ShowTextIntent': function() {
        let displayText = this.event.request.intent.slots.displayText.value;
        if (displayText) {
            let alexa = this

            // Alexa voice/card response to invoke after text is published to AWS IoT successfully
            let alexaEmit = function() {
                alexa.emit(':tellWithCard', alexa.t("SHOW_TEXT", displayText), alexa.t("CARD_TITLE", "ShowText"), displayText)
            }

            // Send publish attempt to AWS IoT
            MirrorMirror.displayText(displayText, alexaEmit);
        } else {
            this.emit(':askWithCard', this.t("SHOW_TEXT_ERR"), this.t("SHOW_TEXT_ERR"), this.t("CARD_TITLE", "ShowTextError"), this.t("SHOW_TEXT_ERR"))
        }
    },
    'ShowImagesIntent': function() {
        let searchTerm = this.event.request.intent.slots.searchTerm.value;
        if (searchTerm) {
            let alexa = this

            // Search for images
            googleImages.search(searchTerm).then(function(images) {
                // Only https urls are allowed for the Alexa cards
                let imageObj = {
                    smallImageUrl: images[0].thumbnail.url,
                    largeImageUrl: images[0].thumbnail.url
                };
                let alexaEmit = function() {
                    alexa.emit(':tellWithCard', alexa.t("SHOW_IMAGE", searchTerm), alexa.t("CARD_TITLE", "ShowImage"), searchTerm, imageObj)
                }

                // Send publish attempt to AWS IoT
                MirrorMirror.showImages(images, searchTerm, alexaEmit);
            })
        } else {
            this.emit(':askWithCard', this.t("SHOW_IMAGE_ERR"), this.t("SHOW_IMAGE_ERR"), this.t("CARD_TITLE", "ShowImageError"), this.t("SHOW_IMAGE_ERR"))
        }
    },
    'TurnOnModuleIntent': function() {
        let moduleName = this.event.request.intent.slots.moduleName.value;
        if (moduleName) {
            let alexa = this
            let alexaEmit = function() {
                alexa.emit(':tellWithCard', alexa.t("TURN_ON_MODULE", moduleName), alexa.t("CARD_TITLE", "OpenModule"), alexa.t("TURN_ON_MODULE", moduleName))
            }

            // Send publish attempt to AWS IoT
            MirrorMirror.changeModule(moduleName, true, alexaEmit);
        } else {
            this.emit(':askWithCard', this.t("TURN_ON_MODULE_ERR"), this.t("TURN_ON_MODULE_ERR"), this.t("CARD_TITLE", "OpenModuleError"), this.t("TURN_ON_MODULE_ERR"))
        }
    },
    'TurnOffModuleIntent': function() {
        let moduleName = this.event.request.intent.slots.moduleName.value;
        if (moduleName) {
            let alexa = this
            let alexaEmit = function() {
                alexa.emit(':tellWithCard', alexa.t("TURN_OFF_MODULE", moduleName), alexa.t("CARD_TITLE", "CloseModule"), alexa.t("TURN_OFF_MODULE", moduleName))
            }

            // Send publish attempt to AWS IoT
            MirrorMirror.changeModule(moduleName, false, alexaEmit);
        } else {
            this.emit(':askWithCard', this.t("TURN_OFF_MODULE_ERR"), this.t("TURN_OFF_MODULE_ERR"), this.t("CARD_TITLE", "CloseModuleError"), this.t("TURN_OFF_MODULE_ERR"))
        }
    },
    'ShowVideoIntent': function() {
        let searchTerm = this.event.request.intent.slots.searchTermVideo.value;
        if (searchTerm) {
            let alexa = this

            // search for Youtube video
            youTube.search(searchTerm, 1, function(error, result) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(JSON.stringify(result, null, 2));

                    let imageObj = {
                        smallImageUrl: result.items[0].snippet.thumbnails.default.url,
                        largeImageUrl: result.items[0].snippet.thumbnails.high.url
                    };
                    let alexaEmit = function() {
                        alexa.emit(':tellWithCard', alexa.t("SHOW_VIDEO", searchTerm), alexa.t("CARD_TITLE", "ShowVideo"), searchTerm, imageObj)
                    }

                    // Send publish attempt to AWS IoT
                    MirrorMirror.showVideo(result.items[0].id.videoId, searchTerm, alexaEmit);
                }
            });
        } else {
            this.emit(':askWithCard', this.t("SHOW_VIDEO_ERR"), this.t("SHOW_VIDEO_ERR"), this.t("CARD_TITLE", "ShowVideoError"), this.t("SHOW_VIDEO_ERR"))
        }
    }
};