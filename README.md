# Mirror Mirror On The Wall Alexa Skill
An [AWS Lambda](http://aws.amazon.com/lambda) function of an Alexa skill for communicating and controlling a [MagicMirror](https://github.com/MichMich/MagicMirror) using AWS IoT Device Gateway.


# It is complementary to the Magic Mirror Module [Mirror Mirror On The Wall](https://github.com/joanaz/MMM-MirrorMirrorOnTheWall).


Please follow the steps below to setup and install this Alexa skill correctly.

## 1. Setup an AWS IoT Device

You need to setup an AWS IoT Device, which is used for the communication between this Alexa skill and the Magic Mirror node app. The credentials you obtained through this process will also be used by the complementary Magic Mirror Module.

  1. Login to __[AWS Management Console](https://console.aws.amazon.com/console/home?region=us-east-1)__
  ![](Screenshots/2-AWSConsole.png)

  1. Choose US East region
  ![](Screenshots/2.1-East.png)

  1. Find __IoT Core__ service
  ![](Screenshots/2.2-IoTCore.png)

  1. Click on __Onboard__ at the left menu bar, under _Configuring a device_, click on __Get Started__
  ![](Screenshots/2.3-IotOnboard.png)

  1. Click on __Get Started__
  ![](Screenshots/2.4-IoTIntro.png)

  1. Choose __Linux/OSX__ platform, and __Node.js__
  ![](Screenshots/2.5-IoTPlatform.png)

  1. Name your device __MagicMirror__
  ![](Screenshots/2.5-Register.png)

  1. Download credentials, aka connection kit
  ![](Screenshots/2.6-DownloadKit.png)

  1. Click on __Next step__
  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-23at17.38.26.png)

  1. Follow the instructions to run the start.sh script, which will generate a root-CA.crt
  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-23at17.38.35.png)

  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-23at18.33.05.png)

  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-23at18.33.21.png)

  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-23at18.34.29.png)

  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-23at18.35.20.png)

  1. Copy all your credential files, then go to your local copy of this repo, and paste them inside the __certs__ folder (which is inside the __src__ folder)
  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-23at18.43.51.png)

## 2. Install Dependencies

Dependencies are installed by navigating to your __src__ directory on command line, and enter `npm install`.

- [alexa-sdk](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) (installed via `npm install`)
- [aws-iot-device-sdk](https://github.com/aws/aws-iot-device-sdk-js) (installed via `npm install`)
- [Google Images Search](https://www.npmjs.com/package/google-images) (installed via `npm install`). Follow the instructions in the link to create your own Google Custom Search Engine, and save the CSE ID and API key in __certs/keys.json__ (see keys_sample.json below).
- [Youtube API](https://www.npmjs.com/package/youtube-node)(installed via `npm install`). Watch this [instruction video](https://youtu.be/Im69kzhpR3I) to create your own Youtube API key, and save it in __certs/keys.json__ (see keys_sample.json below).

### 2.1 keys_sample.json

On your command line, navigate to the __certs__ folder, then enter `cp keys_sample.json keys.json`, which will create a copy of keys_sample.json called keys.json. Copy and paste your API keys obtained above in __keys.json__.

```javascript
// keys_sample.json
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
  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-24at12.07.02.png)

  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-24at11.23.28.png)

  1. Go to the __[AWS Management Console](https://console.aws.amazon.com/console/home?region=us-east-1)__ and click on the __Lambda__ link. Note: ensure you are in __us-east__ region or you won't be able to use Alexa with Lambda.
  ![](Screenshots/2.11-Lambda.png)

  1. Click on the __Create a Function__ button.
  ![](Screenshots/2.12-CreateFun.png)

  1. Choose __Author from scratch__. Name the function (any name is fine). Keep the Handler as index.handler (this refers to the index.js file in the zip). __Create new role from template__ and name it anything. Click on the __Create function__ button.
  ![](Screenshots/2.13-createFun.png)

  ![](Screenshots/2.13-role.png)

  1. Choose trigger __Alexa Skills Kit__ from the left. Disable Skill ID Verification. Click __Add__. Then scroll up and click __Save__.
  ![](Screenshots/2.14-LambdaSuccess.png)

  ![](Screenshots/2.15-ASK.png)

  ![](Screenshots/2.16-Triggers.png)

  ![](Screenshots/2.17-Save.png)

  1. With your Lambda function selected, select __Code entry type__ as "Upload a .ZIP file"
  ![](Screenshots/2.18-UploadCode.png)

  1. Click on __Upload__ button, then upload the zip file created in Step 1 to Lambda. Then __Save__.
  ![](Screenshots/2.19-Save.png)

  1. Copy the __ARN__ from the top right to be used later in the Alexa Skill Setup


## 4. Configure an Alexa Skill to Use Lambda

  1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click on __Alexa Skills Kit__
  ![](Screenshots/2.20-ASK.png)

  1. Click on the __Create Skill__ button.
  ![](Screenshots/2.21-Create.png)

  1. Set "Mirror Mirror On The Wall" as the skill name and click the __Create a skill__ button.
  ![](Screenshots/2.22-CreateSkill.png)

  1. Set "on the wall" as the invocation name. This is what is used to activate your skill.
  ![](Screenshots/2.24-Invocation.png)

  1. Copy the __Interaction Model__ from the included InteractionModel.json in the speechAssets folder.
  ![](Screenshots/2.25-Intents.png)

  1. Select the __AWS Lambda ARN__ for the skill Endpoint and paste the ARN copied from Section 3 Step 8. Click __Save Endpoints__.
  ![](Screenshots/2.28-SavedEndpoint.png)

  1. Click __Build Model__ on the main page if not already built.
  ![](Screenshots/2.29-Build.png)

  1. You can test your Alexa skill by entering invoking it in the Test tab.
  ![](Screenshots/2.30-Test.png)

  1. Click __Your Skills__ at the top. In the skills list, click __View Skill ID__ under MirrorMirrorOnTheWall and copy it.
  ![](Screenshots/2.31-SkillID.png)

  1. Paste the Application Id into the index.js file for the variable __APP_ID__, and save the change
  ![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-24at15.27.21.png)

  1. Delete the zip file generated in Section 3 Step 1, and generate a new zip file using the same method. Upload the new zip file to Lambda. This step makes sure the Lambda function only serves request from an authorized source.

You are now able to start testing your Alexa skill! You should be able to go to the [Amazon Alexa website](http://alexa.amazon.com/spa/index.html#skills/your-skills/?ref-suffix=ysa_gw) and see your skill enabled.

![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-24at16.27.28.png)

![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-24at16.27.37.png)

When you use your skill, you will see the relevant cards show up on the home page.

![](https://github.com/joanaz/MirrorMirrorOnTheWallSkill/raw/screenshots/screenshots/ScreenShot2017-02-24at16.42.34.png)

See the [Examples](#examples) section and the [List of Commands] (#list-of-commands) section below for commands you can say.

*Note: You don't need to publish your Alexa skill, and you better not to publish your skill! Because otherwise your AWS IoT Device Gateway would be shared to other people, and their commands would show up on your mirror.


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


## List of Commands
After you invoked this Alexa skill, you can say any of the following commands to trigger different actions on the Magic Mirror.

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

The text in {} will be searched by Youtube Data API, and the returned video will be played on Magic Mirror, with the text.

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

*Note: To clear the text/images/video displayed by this module, you can simply turn this module off. The spoken name for this module is tentatively "magic mirror"*

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

To turn on all Magic Mirror Module, say:
- `"open all"`
- `"open all modules"`
- `"open every module"`
- `"open each module"`
- `"show all modules"`
- `"show me all modules"`
- `"show every module"`
- `"show each module"`
- `"turn on all"`
- `"turn on all modules"`
- `"turn on every module"`
- `"turn on each module"`
- `"start all"`
- `"start all modules"`
- `"start every module"`
- `"start each module"`

To turn off all Magic Mirror Module, say:
- `"close all"`
- `"close all modules"`
- `"close every module"`
- `"close each module"`
- `"hide all"`
- `"hide all modules"`
- `"hide every module"`
- `"hide each module"`
- `"turn off all"`
- `"turn off all modules"`
- `"turn off every module"`
- `"turn off each module"`
`"hide all"`
- `"hide all modules"`
- `"hide every module"`
- `"hide each module"`
- `"turn off all"`
- `"turn off all modules"`
- `"turn off every module"`
- `"turn off each module"`
