# Magic Mirror

**Magic Mirror created by Tim Mulders**

## Config.js

The config.js file is used to create every component. By filling the variables with the user information the mirror will show all the right value’s.

In the config it’s possible to have multiple components of one kind. by duplicating a variable in the array of a variable it will create two instances of that component.
for example:
The basic time variable looks like this:
`time: [{
    timeFormat: 24,
    displaySeconds: true,
    position: 'top left'
   }]`

if you want another time component that, for instance, displays the time in a 12-hour format you can do so by duplicating the object in the array and add it to the array. This will result in this:
`time: [{
    timeFormat: 24,
    displaySeconds: true,
    position: 'top left'
   },
   {
    timeFormat: 12,
    displaySeconds: true,
    position: 'top right’
   }]`

With this it will show a 24-hour clock in the top left part of the screen and a 12-hour clock in the top right part of the screen.

### language

By setting the variable `lang` to the language which you use. This will change the language of the displayed date and calendar.

### Time

The time can be shown as a 24-hour clock or a 12-hour clock. Add the following variables to the config to make it work:
 - `timeFormat` This variable is used to format the time and accepts `12` and `24` as value’s.
 - `displaySeconds` By setting this variable to `true` it will display the seconds as well.

### Weather

To display the weather you’ll need to add the following variables:
 - `appID` Here you’ll need to fill in the API key of [OpenWeatherMap](http://openweathermap.org)
 - `city` The city you want to be shown, like ‘Nijmegen’
 - `country` The country that the city belongs to, like ‘Netherlands’

### Series
It’s possible to display the series that have been released yesterday. To do this it uses **SickBeard**. By adding the series to SickBeard it is possible to display these in the mirror. For the connection with SickBeard it needs the following information:
 - `api` The API key of SickBeard is needed.
 - `port` The port that SickBeard uses is needed to connect.
 - `url` This one is **OPTIONAL**. By default it uses the url that it’s on. this should only be used if your SickBeard is on a different server.

### Calendar
To see your plans for the next couple of days you can add the following variables:
 - `maximumEntries` This limits the amount of events that are shown on the mirror.
 - `urls` These will be the links to the calendars. Here we’ll need the following variables:
  - `symbol` The symbol that needs to be displayed. You’ll need to fill in the name of the symbol given by **font-awesome**
  - `url` The url of the calendar. iCloud calendar is supported by default. Google calendar should be supported as well, but is not tested yet.

### Trello
Want to check your Trello todo list? To see what you planned to do for the next couple of days you can add the following variables:
 - `maxAmount` This limits the amount of cards that are shown on the mirror.
 - `name` A name that will be shown at the top of the list.
 - `api` The API key, which will need to be provided by the user. To get your api please visit [Trello](https://trello.com/app-key).
 - `refreshTime` The amount of **seconds** that the list needs to be refreshed. Its default is a minute.

## Position

Every variable in the config file will need a `position`. There are the following positions in the index.html: **top left**, **top right**, **center**, **bottom left** and **bottom right**.

## Installation

To use the software you’ll need a apache server.
There is not much installing, except for downloading the files and placing them on the server.
On Raspbian install the apache server.
after installing you just need to paste the files in /var/www/html folder and make sure everybody can access it by using the following code: `sudo chmod -R 755 /var/www/html`.
