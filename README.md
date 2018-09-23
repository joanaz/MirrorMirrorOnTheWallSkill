# Mirror Mirror On The Wall Alexa Skill
An [AWS Lambda](http://aws.amazon.com/lambda) function of an Alexa skill for communicating and controlling a [MagicMirror](https://github.com/MichMich/MagicMirror) using AWS IoT Device Gateway. *It is complementary to the Magic Mirror Module [Mirror Mirror On The Wall](https://github.com/joanaz/MMM-MirrorMirrorOnTheWall).*

Please follow the __[Instructions](https://joanaz.github.io/MirrorMirrorOnTheWallSkill/)__ to setup and deploy this Alexa skill.


## Example Voice Commands

```
User: "Alexa, start magic mirror"
Alexa: "Hello my Queen, what can I do for you? "
```

If you are running [AlexaPi](https://github.com/alexa-pi/AlexaPi) on Raspberry Pi, or using a wake word engine like [Snowboy](https://github.com/Kitt-AI/snowboy), you can change the wake word from "Alexa" to "Mirror Mirror", you can also change the Alexa Skill invocation name to "on the wall". So together, you just say:

```
User: "Mirror Mirror on the Wall, say Hello"
Alexa: "Yes, my Queen. Hello."
```

If you enabled the [complementary Magic Mirror Module](https://github.com/joanaz/MMM-MirrorMirrorOnTheWall), the word "hello" will also be displayed on your Magic Mirror.


## Full List of Voice Commands
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
