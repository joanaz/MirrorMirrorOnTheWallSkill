'use strict';
/**
 * A Lambda function for handling Alexa Skill MirrorMirrorOnTheWall requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa On The Wall, find Snow White."
 *  Alexa: "Yes my Queen, showing images of Snow White."
 */

///const Alexa = require('alexa-sdk');
const Alexa = require('ask-sdk-core')
const got = require('got');
const fs = require('fs');

const MirrorMirror = require('./MirrorMirror');

const Keys = require("./certs/keys.json");

const GoogleImages = require('google-images');
var googleImages = new GoogleImages(Keys.cse.ID, Keys.cse.API_key);

const YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey(Keys.youtube.API_key);

// google translation(if you don't want the translate feature, just add an empty certs/google-translate-service.json)
// 1. sign up a google cloud platform account and create a project
// 2. create a service account in the project and downn load the authentication json
//    into certs folder and name it google-translate-service.json
// 3. enable google cloud translate api in your project
const googleServiceKey = require("./certs/google-translate-service.json");
// write the translate service key to temp foler so it matches the env variable
// in your aws lambda function, add an env variable: GOOGLE_APPLICATION_CREDENTIALS = /tmp/googleService.json
(
	function() {
		if (Keys.translate && !fs.existsSync(Keys.translate.translateServiceKeyPath)) {
			fs.writeFileSync(Keys.translate.translateServiceKeyPath,
							 JSON.stringify(googleServiceKey));
		}
	}
)();

const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;
const translationClient = new TranslationServiceClient();

const LaunchRequestHandler = {

    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = languageStrings["WELCOME_MESSAGE"]
        const repromptText = languageStrings["WELCOME_REPROMPT"]
        const cardText = languageStrings["WELCOME_CARD"]
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .withSimpleCard(cardText, speechText)
            .getResponse();
    }
};

const MirrorMirrorHelloIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MirrorMirrorHelloIntent';
    },
    handle(handlerInput) {
        const speechText = languageStrings["WELCOME_MESSAGE"]
        const repromptText = languageStrings["WELCOME_REPROMPT"]
        const cardText = languageStrings["WELCOME_CARD"]
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .withSimpleCard(cardText, speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = languageStrings["HELP_MESSAGE"];
        const cardText = languageStrings["HELP_CARD"]

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(cardText, speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    async handle(handlerInput) {
        const speechText = languageStrings["STOP_MESSAGE"];
        const cardText = languageStrings["STOP_CARD"]

		await MirrorMirror.displayText("");
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(cardText, speechText)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    }
};

// Handler for showing the text. Calls function that publishes text to IOT device
const ShowTextIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ShowTextIntent';
    },
    async handle(handlerInput) {
        let displayText = handlerInput.requestEnvelope.request.intent.slots.displayText.value;
        const speechText = languageStrings["SHOW_TEXT"];
        const cardText = languageStrings["SHOW_TEXT_CARD"];
        const errorText = languageStrings["SHOW_TEXT_ERR"];

        if(displayText) {
            await MirrorMirror.displayText(displayText);
            return handlerInput.responseBuilder
                    .speak(speechText + displayText) // shouldnt  it be displayText onyly
                    .withSimpleCard(cardText, displayText)
                    .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak("error with function")
                .getResponse();
        }
    }
};

const TranslateTextIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TranslateTextIntent';
    },
    async handle(handlerInput) {
        let translateText = handlerInput.requestEnvelope.request.intent.slots.translateText.value;
        const speechText = languageStrings["TRANSLATE_TEXT"];
        const cardText = languageStrings["TRANSLATE_TEXT_CARD"];
        const errorText = languageStrings["TRANSLATE_TEXT_ERR"];

		console.log("translateText=" + translateText);
        if(translateText) {
			try {
				const request = {
				    parent: translationClient.locationPath(Keys.translate.projectId, "global"),
				    contents: [translateText],
				    mimeType: 'text/plain', // mime types: text/plain, text/html
				    sourceLanguageCode: Keys.translate.sourceLanguageCode,
				    targetLanguageCode: Keys.translate.targetLanguageCode
  				};

				const [response] = await translationClient.translateText(request);
				//console.log(response);
				let translatedText = "";
				if (response && response.translations && response.translations.length > 0) {
					translatedText = response.translations[0].translatedText;
				}

            	await MirrorMirror.displayText(translateText + " | " + translatedText);
            	return handlerInput.responseBuilder
                	.speak(speechText + translateText)
                    .withSimpleCard(cardText, translateText + " | " + translatedText)
                   	.getResponse();
			} catch(err) {
				console.log(err);
				return handlerInput.responseBuilder
				    .speak("Failed to translate " + translateText)
	                .getResponse();
			}
        } else {
            return handlerInput.responseBuilder
                .speak(errorText)
                .getResponse();
        }
    }
};

const ShowImagesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ShowImagesIntent';
    },
    async handle(handlerInput) {
        let searchTerm = handlerInput.requestEnvelope.request.intent.slots.searchTerm.value;
        const speechText = languageStrings["SHOW_IMAGE"];
        const cardText = languageStrings["SHOW_IMAGE_CARD"];
        const errorText = languageStrings["SHOW_IMAGE_ERR"];

        if (searchTerm) {
			try {
                const images = await googleImages.search(searchTerm);
            	// Only https urls are allowed for the Alexa cards
            	let imageObj = {
            	    smallImageUrl: "",
            	    largeImageUrl: ""
            	};

				if(images && images.length > 0) {
					imageObj.smallImageUrl = images[0].thumbnail.url;
					imageObj.largeImageUrl = images[0].url;
				}

            	console.log(images);
            	console.log(imageObj);

				// show max 5 images
            	await MirrorMirror.showImages(images.slice(0, images.length > 5 ? 5 : images.length),
            									searchTerm);

            	return handlerInput.responseBuilder
            	            .speak(speechText + searchTerm + "'")
            	            .withStandardCard(cardText, searchTerm, imageObj['smallImageUrl'], imageObj['largeImageUrl'])
            	            .getResponse();
			} catch(err) {
				console.log(err);
	            return handlerInput.responseBuilder
	                .speak(languageStrings["SEARCH_IMAGE_ERR"])
	                .getResponse();
			}
        } else{
            return handlerInput.responseBuilder
                .speak(errorText)
                .getResponse();
        }
    }
};


const TurnOnModuleIntent = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TurnOnModuleIntent';
    },
    async handle(handlerInput) {
        let moduleName = handlerInput.requestEnvelope.request.intent.slots.moduleName.value;
        const speechText = languageStrings["TURN_ON_MODULE"];
        const cardText = languageStrings["TURN_ON_MODULE_CARD"];
        const errorText = languageStrings["TURN_ON_MODULE_ERR"];
        const cardContent = languageStrings["TURN_ON_MODULE"];
        if(moduleName) {
            await MirrorMirror.changeModule(moduleName, true);
            return handlerInput.responseBuilder
                    .speak(speechText + moduleName + "'")
                    .withSimpleCard(cardText, cardContent)
                    .getResponse();
        }
        else{
            return handlerInput.responseBuilder
                .speak(errorText)
                .getResponse();
        }
    }
};

const TurnOnAllModuleIntent = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TurnOnAllModuleIntent';
    },
    async handle(handlerInput){
        const speechText = languageStrings["TURN_ON_ALL_MODULES"];
        const cardText = languageStrings["TURN_ON_ALL_MODULES_CARD"];
        const cardContent = languageStrings["TURN_ON_ALL_MODULES"];

        await MirrorMirror.changeModule('all_modules', true);
        return handlerInput.responseBuilder
                .speak(speechText)
                .withSimpleCard(cardText, cardContent)
                .getResponse();
    }
};

const TurnOffModuleIntent = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'&& handlerInput.requestEnvelope.request.intent.name === 'TurnOffModuleIntent';
    },
    async handle(handlerInput){
        let moduleName = handlerInput.requestEnvelope.request.intent.slots.moduleName.value;

        const speechText = languageStrings['TURN_OFF_MODULE'];
        const cardText = languageStrings['TURN_OFF_MODULE'];
        const cardContent = languageStrings['TURN_OFF_MODULE'];
        const errorText = languageStrings['TURN_OFF_MODULE_ERR'];

        if (moduleName) {
            await MirrorMirror.changeModule(moduleName, false);
            return handlerInput.responseBuilder
                    .speak(speechText + moduleName + "'")
                    .withSimpleCard(cardText, cardContent)
                    .getResponse();

        } else {
            return handlerInput.responseBuilder
                .speak(errorText)
                .getResponse();
        }
    }
};

const TurnOffAllModuleIntent = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TurnOffAllModuleIntent';
    },
    async handle(handlerInput) {
        const speechText = languageStrings['TURN_OFF_ALL_MODULES'];
        const cardText = languageStrings['TURN_OFF_ALL_MODULES_CARD'];
        const cardContent = languageStrings['TURN_OFF_ALL_MODULES']

        await MirrorMirror.changeModule('all_modules', false);
        return handlerInput.responseBuilder
                .speak(speechText)
                .withSimpleCard(cardText, cardContent)
                .getResponse();
    }
}

function youTubeSearch(searchTerm) {
	return new Promise(((resolve, reject) => {
		youTube.search(searchTerm, 1, function(error, result) {
			if (error) {
				reject(error);
			} else {
				resolve(result);
			}
		});
	}));
}

const ShowVideoIntent = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ShowVideoIntent';
    },
    async handle(handlerInput) {
        const speechText = languageStrings['SHOW_VIDEO'];
        const cardText = languageStrings['SHOW_VIDEO_CARD'];
        const cardContent = languageStrings['SHOW_VIDEO'];
        const errorText = languageStrings['SHOW_VIDEO_ERR'];

        console.log(handlerInput.requestEnvelope.request.intent.slots.searchTermVideo.value);
        let searchTerm = handlerInput.requestEnvelope.request.intent.slots.searchTermVideo.value;
        if (searchTerm) {
			try {
            	const result = await youTubeSearch(searchTerm);
                console.log(JSON.stringify(result, null, 2));
                let imageObj = {
                    smallImageUrl: result.items[0].snippet.thumbnails['default'].url,
                    largeImageUrl: result.items[0].snippet.thumbnails.high.url
                };
                console.log(JSON.stringify(imageObj));

                await MirrorMirror.showVideo(result.items[0].id.videoId, searchTerm);
                return handlerInput.responseBuilder
                            .speak(speechText + searchTerm + "'")
                            .withStandardCard(cardText, searchTerm, imageObj['smallImageUrl'], imageObj['largeImageUrl'])
                            .getResponse();
			} catch(err) {
				console.log(err);
				return handlerInput.responseBuilder
	                .speak(languageStrings['SEARCH_VIDEO_ERR'])
	                .getResponse();
			}

        } else {
            return handlerInput.responseBuilder
                .speak(errorText)
                .getResponse();
        }
    }
};

const TakeAPictureHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TakePictureIntent';
    },
    handle(handlerInput) {
       console.log("This ran")
       MirrorMirror.takePicture();
       return handlerInput.responseBuilder.speak("yes, taking a picture").getResponse();
    }
};

var languageStrings = {
    "WELCOME_MESSAGE": "Hello, what can I do for you? ",
    "WELCOME_REPROMPT": "I can show you text and images, if you give me commands like 'say today is a beautiful day' or 'find pictures of cats'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you?",
    "WELCOME_CARD": "Hello",
    "HELP_MESSAGE": "Hello, I can show you text and images, if you give me commands like 'say today is a beautiful day' or 'find pictures of cats'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you?",
    "HELP_CARD": "Help",
    "STOP_MESSAGE": "See you next time!",
    "STOP_CARD": "Goodbye",
    "SHOW_TEXT": "Yes. ",
    "SHOW_TEXT_ERR": "Sorry, I didn't get that. You can give me commands like 'display text of hello', or 'say you are the fairest of them all'. What can I do for you?",
    "SHOW_TEXT_CARD": "Display Text",
    "TRANSLATE_TEXT": "Translating ",
    "TRANSLATE_TEXT_ERR": "Sorry, I didn't get that. You can give me commands like 'translate hello'. What can I do for you?",
    "TRANSLATE_TEXT_CARD": "Translate Text",
    "SHOW_IMAGE": "Yes, showing images of '",
    "SHOW_IMAGE_ERR": "Sorry, I didn't get that. You can give me commands like 'find Snow White' or 'show me images of Bill Gates'. What can I do for you?",
    "SHOW_IMAGE_CARD": "Show Image",
    "TURN_ON_MODULE": "Yes, opening module '",
    "TURN_ON_MODULE_ERR": "Sorry, I didn't get that. You can give me commands like 'open current weather' or 'turn on compliments'. What can I do for you?",
    "TURN_ON_MODULE_CARD": "Open Module",
    "TURN_ON_ALL_MODULES": "Yes, opening all modules.",
    "TURN_ON_ALL_MODULES_CARD": "Open All Modules",
    "TURN_OFF_MODULE": "Yes, closing module '",
    "TURN_OFF_MODULE_ERR": "Sorry, I didn't get that. You can give me commands like 'close current weather' or 'turn off compliments'. What can I do for you?",
    "TURN_OFF_MODULE_CARD": "Close Module",
    "TURN_OFF_ALL_MODULES": "Yes, closing all modules.",
    "TURN_OFF_ALL_MODULES_CARD": "Close All Modules",
    "SHOW_VIDEO": "Yes, showing a video of '",
    "SHOW_VIDEO_ERR": "Sorry, I didn't get that. You can give me commands like 'find a video of Snow White' or 'show me a video of Bill Gates'. What can I do for you?",
    "SHOW_VIDEO_CARD": "Play Video",
    "ERROR_CARD": "Error",
    "SEARCH_IMAGE_ERR": "Failed to search image.",
    "SEARCH_VIDEO_ERR": "Failed to search video."
}

let skill;

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        MirrorMirrorHelloIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        ShowTextIntentHandler,
        TranslateTextIntentHandler,
        ShowImagesIntentHandler,
        TurnOnModuleIntent,
        TurnOnAllModuleIntent,
        TurnOffModuleIntent,
        TurnOffAllModuleIntent,
        ShowVideoIntent,
        TakeAPictureHandler)
    .addErrorHandlers(ErrorHandler)
    .lambda();

// The following is a bunch of the old code
// Still here for reference

/*
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
            "WELCOME_CARD": "Hello",
            "HELP_MESSAGE": "Hello my Queen, I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you, my Queen?",
            "HELP_CARD": "Help",
            "STOP_MESSAGE": "See you next time, my Queen!",
            "STOP_CARD": "Goodbye",
            "SHOW_TEXT": "Yes, my Queen. %s.",
            "SHOW_TEXT_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'display text of hello', or 'say you are the fairest of them all'. What can I do for you, my Queen?",
            "SHOW_TEXT_CARD": "Display Text",
            "SHOW_IMAGE": "Yes, my Queen, showing images of %s.",
            "SHOW_IMAGE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'find Snow White' or 'show me images of Bill Gates'. What can I do for you, my Queen?",
            "SHOW_IMAGE_CARD": "Show Image",
            "TURN_ON_MODULE": "Yes, my Queen, opening module %s.",
            "TURN_ON_MODULE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'open current weather' or 'turn on compliments'. What can I do for you, my Queen?",
            "TURN_ON_MODULE_CARD": "Open Module",
            "TURN_ON_ALL_MODULES": "Yes, my Queen, opening all modules.",
            "TURN_ON_ALL_MODULES_CARD": "Open All Modules",
            "TURN_OFF_MODULE": "Yes, my Queen, closing module %s.",
            "TURN_OFF_MODULE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'close current weather' or 'turn off compliments'. What can I do for you, my Queen?",
            "TURN_OFF_MODULE_CARD": "Close Module",
            "TURN_OFF_ALL_MODULES": "Yes, my Queen, closing all modules.",
            "TURN_OFF_ALL_MODULES_CARD": "Close All Modules",
            "SHOW_VIDEO": "Yes, my Queen, showing a video of %s.",
            "SHOW_VIDEO_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'find a video of Snow White' or 'show me a video of Bill Gates'. What can I do for you, my Queen?",
            "SHOW_VIDEO_CARD": "Play Video",
            "ERROR_CARD": "Error"
        }
    },
    "en-GB": {
        "translation": {
            "WELCOME_MESSAGE": "Hello my Queen, what can I do for you? ",
            "WELCOME_REPROMPT": "I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you, my Queen?",
            "WELCOME_CARD": "Hello",
            "HELP_MESSAGE": "Hello my Queen, I can show you text and images, if you give me commands like 'say you are the fairest of them all' or 'find Snow White'. I can also open or close a magic mirror module, if you say commands like 'open compliments', or 'close weather forecast'. What can I do for you, my Queen?",
            "HELP_CARD": "Help",
            "STOP_MESSAGE": "See you next time, my Queen!",
            "STOP_CARD": "Goodbye",
            "SHOW_TEXT": "Yes, my Queen. %s.",
            "SHOW_TEXT_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'display text of hello', or 'say you are the fairest of them all'. What can I do for you, my Queen?",
            "SHOW_TEXT_CARD": "Display Text",
            "SHOW_IMAGE": "Yes, my Queen, showing images of %s.",
            "SHOW_IMAGE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'find Snow White' or 'show me images of Bill Gates'. What can I do for you, my Queen?",
            "SHOW_IMAGE_CARD": "Show Image",
            "TURN_ON_MODULE": "Yes, my Queen, opening module %s.",
            "TURN_ON_MODULE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'open current weather' or 'turn on compliments'. What can I do for you, my Queen?",
            "TURN_ON_MODULE_CARD": "Open Module",
            "TURN_ON_ALL_MODULES": "Yes, my Queen, opening all modules.",
            "TURN_ON_ALL_MODULES_CARD": "Open All Modules",
            "TURN_OFF_MODULE": "Yes, my Queen, closing module %s.",
            "TURN_OFF_MODULE_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'close current weather' or 'turn off compliments'. What can I do for you, my Queen?",
            "TURN_OFF_MODULE_CARD": "Close Module",
            "TURN_OFF_ALL_MODULES": "Yes, my Queen, closing all modules.",
            "TURN_OFF_ALL_MODULES_CARD": "Close All Modules",
            "SHOW_VIDEO": "Yes, my Queen, showing a video of %s.",
            "SHOW_VIDEO_ERR": "Sorry, my Queen, I didn't get that. You can give me commands like 'find a video of Snow White' or 'show me a video of Bill Gates'. What can I do for you, my Queen?",
            "SHOW_VIDEO_CARD": "Play Video",
            "ERROR_CARD": "Error"
        }
    }
};

var handlers = {
    'LaunchRequest': function() {           // done
        this.emit('SayHello');
    },
    'MirrorMirrorHelloIntent': function() {     //done
        this.emit('SayHello');
    },
    'SayHello': function() {
        this.emit(':askWithCard', this.t("WELCOME_MESSAGE"), this.t("WELCOME_REPROMPT"), this.t("WELCOME_CARD"), this.t("WELCOME_MESSAGE") + this.t("WELCOME_REPROMPT"));
    },
    'AMAZON.HelpIntent': function() {           // done
        this.emit(':askWithCard', this.t("HELP_MESSAGE"), this.t("HELP_MESSAGE"), this.t("HELP_CARD"), this.t("HELP_MESSAGE"));
    },
    'AMAZON.StopIntent': function() {           // done?
        this.emit('StopCommand');
    },
    'AMAZON.CancelIntent': function() {         // done?
        this.emit('StopCommand');
    },
    'StopCommand': function() {                 // done?
        this.emit(':tellWithCard', this.t("STOP_MESSAGE"), this.t("STOP_CARD"), this.t("STOP_MESSAGE"));
    },
    'ShowTextIntent': function() {              // done
        let displayText = this.event.request.intent.slots.displayText.value;
        if (displayText) {
            let alexa = this

            // Alexa voice/card response to invoke after text is published to AWS IoT successfully
            let alexaEmit = function() {
                alexa.emit(':tellWithCard', alexa.t("SHOW_TEXT", displayText), alexa.t("SHOW_TEXT_CARD"), displayText)
            }

            // Send publish attempt to AWS IoT
            MirrorMirror.displayText(displayText, alexaEmit);
        } else {
            this.emit(':askWithCard', this.t("SHOW_TEXT_ERR"), this.t("SHOW_TEXT_ERR"), this.t("ERROR_CARD"), this.t("SHOW_TEXT_ERR"))
        }
    },
    'ShowImagesIntent': function() {            // done, Alex
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
                    alexa.emit(':tellWithCard', alexa.t("SHOW_IMAGE", searchTerm), alexa.t("SHOW_IMAGE_CARD"), searchTerm, imageObj)
                }

                // Send publish attempt to AWS IoT
                MirrorMirror.showImages(images, searchTerm, alexaEmit);
            })
        } else {
            this.emit(':askWithCard', this.t("SHOW_IMAGE_ERR"), this.t("SHOW_IMAGE_ERR"), this.t("ERROR_CARD"), this.t("SHOW_IMAGE_ERR"))
        }
    },
    'TurnOnModuleIntent': function() {
        let moduleName = this.event.request.intent.slots.moduleName.value;
        if (moduleName) {
            let alexa = this
            let alexaEmit = function() {
                alexa.emit(':tellWithCard', alexa.t("TURN_ON_MODULE", moduleName), alexa.t("TURN_ON_MODULE_CARD"), alexa.t("TURN_ON_MODULE", moduleName))
            }

            // Send publish attempt to AWS IoT
            MirrorMirror.changeModule(moduleName, true, alexaEmit);
        } else {
            this.emit(':askWithCard', this.t("TURN_ON_MODULE_ERR"), this.t("TURN_ON_MODULE_ERR"), this.t("ERROR_CARD"), this.t("TURN_ON_MODULE_ERR"))
        }
    },
    'TurnOnAllModuleIntent': function() {
        let alexa = this
        let alexaEmit = function() {
            alexa.emit(':tellWithCard', alexa.t("TURN_ON_ALL_MODULES"), alexa.t("TURN_ON_ALL_MODULES_CARD"), alexa.t("TURN_ON_ALL_MODULES"))
        }
        MirrorMirror.changeModule('all_modules', true, alexaEmit);

    },
    'TurnOffModuleIntent': function() {
        let moduleName = this.event.request.intent.slots.moduleName.value;
        if (moduleName) {
            let alexa = this
            let alexaEmit = function() {
                alexa.emit(':tellWithCard', alexa.t("TURN_OFF_MODULE", moduleName), alexa.t("TURN_OFF_MODULE_CARD"), alexa.t("TURN_OFF_MODULE", moduleName))
            }

            // Send publish attempt to AWS IoT
            MirrorMirror.changeModule(moduleName, false, alexaEmit);
        } else {
            this.emit(':askWithCard', this.t("TURN_OFF_MODULE_ERR"), this.t("TURN_OFF_MODULE_ERR"), this.t("ERROR_CARD"), this.t("TURN_OFF_MODULE_ERR"))
        }
    },
    'TurnOffAllModuleIntent': function() {
        let alexa = this
        let alexaEmit = function() {
            alexa.emit(':tellWithCard', alexa.t("TURN_OFF_ALL_MODULES"), alexa.t("TURN_OFF_ALL_MODULES_CARD"), alexa.t("TURN_OFF_ALL_MODULES"))
        }
        MirrorMirror.changeModule('all_modules', false, alexaEmit);

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
                        alexa.emit(':tellWithCard', alexa.t("SHOW_VIDEO", searchTerm), alexa.t("SHOW_VIDEO_CARD"), searchTerm, imageObj)
                    }

                    // Send publish attempt to AWS IoT
                    MirrorMirror.showVideo(result.items[0].id.videoId, searchTerm, alexaEmit);
                }
            });
        } else {
            this.emit(':askWithCard', this.t("SHOW_VIDEO_ERR"), this.t("SHOW_VIDEO_ERR"), this.t("ERROR_CARD"), this.t("SHOW_VIDEO_ERR"))
        }
    }
};
*/