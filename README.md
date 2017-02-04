# Mirror Mirror On The Wall Alexa Skill
An [AWS Lambda](http://aws.amazon.com/lambda) function of an Alexa skill for communicating and controlling a [MagicMirror](https://github.com/MichMich/MagicMirror) using AWS IoT Device Gateway. 

It is complementary to the Magic Mirror Module [Mirror Mirror On The Wall](https://github.com/joanaz/MMM-MirrorMirrorOnTheWall).

Please follow the four steps below to setup and install this Alexa skill correctly.

## 1. Setup an AWS IoT Device

You need to setup an AWS IoT Device, which is used for the communication between this Alexa skill and the Magic Mirror node app. The credentials you obtained through this process will also be used by the complementary Magic Mirror Module.

1. login to __[AWS Management Console](https://console.aws.amazon.com/console/home?region=us-east-1)__
2. find __AWS IoT__ service
3. click on __Connect__ at the left menu bar
4. under _Configuring a device_, click on __Get Started__
5. choose __Linux/OSX__ platform, and __Node.JS__
6. give your device a name, any name is fine
7. download credentials and run the start.sh script, which will generate a root-CA.crt
8. go to your local copy of this repo, create a folder called __certs__ inside the __src__ folder
9. place all the credentials in the __certs__ folder
10. open MirrorMirror.js, replace the __keyPath__, __certPath__, and __caPath__ with your own credentials' paths


## 2. Install Dependencies

Dependencies are installed by navigating to your __src__ directory on command line, and enter `npm install`.

- [alexa-sdk](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) (installed via `npm install`)
- [aws-iot-device-sdk](https://github.com/aws/aws-iot-device-sdk-js) (installed via `npm install`)
- [Google Images Search](https://www.npmjs.com/package/google-images) (installed via `npm install`). Follow the instructions in the link to create your own Google Custom Search Engine, and save the CSE ID and API key in __certs/keys.json__ (see sample keys.json below).
- [Youtube API](https://www.npmjs.com/package/youtube-node)(installed via `npm install`). Watch this [instruction video](https://youtu.be/Im69kzhpR3I) to create your own Youtube API key, and save it in __certs/keys.json__ (see sample keys.json below).

### Sample keys.json
```
{
    "cse": {
        "ID": "YOUR GOOGLE CUSTOM SEARCH ENGINE ID",
        "API_key": "YOUR GOOGLE PROJECT API KEY"
    },
    "youtube": {
        "API_key": "YOUR YOUTUBE API KEY"
    }
}
```

## 3. Deploy the Code in AWS Lambda

1. Go inside your local __src__ directory, select all files and folders and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.
2. Go to the __[AWS Management Console](https://console.aws.amazon.com/console/home?region=us-east-1)__ and click on the __Lambda__ link. Note: ensure you are in __us-east__ region or you won't be able to use Alexa with Lambda.
3. Click on the __Create a Lambda Function__ or __Get Started Now__ button.
4. Choose __Blank Blueprint__
5. Choose trigger __Alexa Skills Kit__, click "Next"
6. Name the Lambda Function, select the runtime as __Node.js__
7. Select __Code entry type__ as "Upload a .ZIP file" and then upload the .zip file from step 1 to the Lambda
8. Keep the Handler as index.handler (this refers to the main js file in the zip).
9. __Create new role from template__ and name it anything.
10. Leave the Advanced settings as the defaults.
11. Click "Next" and review the settings then click "Create Function"
12. Copy the __ARN__ from the top right to be used later in the Alexa Skill Setup

## 4. Configure an Alexa Skill to Use Lambda

1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click __Add a New Skill__.
2. Set "Mirror Mirror On The Wall" as the skill name and "on the wall" as the invocation name, this is what is used to activate your skill.
3. Select the __Lambda ARN__ for the skill Endpoint and paste the ARN copied from above. Click Next.
4. Copy the __Intent Schema__ from the included IntentSchema.json in the speechAssets folder.
5. Copy the __Sample Utterances__ from the included SampleUtterances.txt. Click Next.
6. Go back to the skill Information tab and copy the appId. Paste the appId into the index.js file for the variable __APP_ID__, then update the Lambda source zip file with this change and __upload to Lambda__ again, this step makes sure the Lambda function only serves request from authorized source.
7. You are now able to start testing your Alexa skill! You should be able to go to the [Echo webpage](http://echo.amazon.com/#skills) and see your skill enabled.
8. In order to test it, try to say some of the Sample Utterances from the Examples section below.
9. You don't need to publish your skill.

## Examples

```
User: "Alexa, On The Wall, hello"
Alexa: "Hello my Queen, what can I do for you? "
```

If you are running [AlexaPi](https://github.com/alexa-pi/AlexaPi) on Raspberry Pi, or using a wake word engine like [Snowboy](https://github.com/Kitt-AI/snowboy), you can change the wake word from "Alexa" to "Mirror Mirror", then you can say:

```
User: "Mirror Mirror On The Wall, say Hello"
Alexa: "Yes, my Queen. Hello."
```

If you enabled the [complementary Magic Mirror Module](https://github.com/joanaz/MMM-MirrorMirrorOnTheWall), the word "hello" will also be displayed on your Magic Mirror.


## List of commands
After you invoked this Alexa skill by saying `"Mirror Mirror On The Wall"`, you can say any of the following commands to trigger different actions on the Magic Mirror.

### Display text

The text in {} will be displayed on Magic Mirror in bold.

- `"say {hello}"`
- `"say {good morning}"`
- `"say {you are the fairest of them all}"`
- `"display text of {hello}"`
- `"display text of {good morning}"`
- `"show text of {hello}"`
- `"show text of {good morning}"`

### Display images

The text in {} will be searched by Google Image Search API, and the returned images will be displayed on Magic Mirror, with the text.

- `"find {snow white}"`
- `"find images of {hunter}"`
- `"find pictures of {dwarfs}"`
- `"show me {snow white}"`
- `"show me pictures of {hunter}"`
- `"show me images of {dwarfs}"`
- `"show pictures of {hunter}"`
- `"show images of {snow white}"`
- `"display pictures of {dwarfs}"`
- `"display images of {dwarfs}"`

### Display video

The text in {} will be searched by Youtube Data API, and the returned video will be displayed on Magic Mirror, with the text.

- `"show me how to {make slime}"`
- `"show me video of {movie trailer}"`
- `"show me a video of {cats}"`
- `"show video of {volcanoes}"`
- `"show a video of {birds}"`
- `"display video of {animals}"`
- `"display a video of {rattle snakes}"`
- `"find video of {cat}"`
- `"find video of {cat and dog}"`
- `"find a video of {snow white}"`

### Turn on/off Magic Mirror Modules

To turn on/off a Magic Mirror Module, it has to be installed and configured in the main project already. You also have to map its official module name to a transcribable spoken name in ModuleNames.json. For example, ["MMM-Globe"](https://github.com/LukeSkywalker92/MMM-Globe) maps to "globe", ["currentweather"](https://github.com/MichMich/MagicMirror/tree/master/modules/default/currentweather) maps to "current weather".

To turn on a Magic Mirror Module, say:
- `"start {newsfeed}"`
- `"start {current weather}"`
- `"turn on {compliments}"`
- `"open {smile test}"`

To turn off a Magic Mirror Module, say:
- `"close {newsfeed}"`
- `"close {current weather}"`
- `"turn off {compliments}"`
- `"finish {smile test}"`
