/**
 * Created by Tim Mulders on 11-04-16.
 */
jQuery.fn.updateWithText = function(text, speed) {
	var dummy = $('<div/>').html(text);

	if ($(this).html() != dummy.html())
	{
		$(this).fadeOut(speed/2, function() {
			$(this).html(text);
			$(this).fadeIn(speed/2, function() {
				//done
			});
		});
	}
};

function AjaxRequest() {
  var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"]; //activeX versions to check for in IE
  if (window.ActiveXObject) { //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
    for (var i=0; i<activexmodes.length; i++){
      try{
        return new ActiveXObject(activexmodes[i]);
      }
      catch(e){
        //suppress error
      }
    }
  }
  else if (window.XMLHttpRequest) // if Mozilla, Safari etc
    return new XMLHttpRequest();
  else
    return false;
}
function Controller() {
  var me = this;
  moment.locale(config.lang);
  this.setConfig(this.getServerConfig());
  this.createTime(config.time);
  this.createWeather(config.weather);
  this.createSeries(config.series);
  this.createCalendar(config.calendar);
  setInterval(function () {
    me.checkConfig();
  }, 5000);
}

Controller.prototype.createTime = function (time) {
  for (var i = 0; i < time.length; i++) {
    if (time[i].timeFormat && time[i].displaySeconds && time[i].position) {
      this.createTimeComponent(time[i].timeFormat, time[i].displaySeconds, time[i].position);
    }
  }
};

Controller.prototype.createWeather = function (weather) {
  for (var i = 0; i < weather.length; i++) {
    if (weather[i].country && weather[i].city && weather[i].appID && weather[i].position) {
      this.createWeatherComponent(weather[i].country, weather[i].city, weather[i].appID, weather[i].position);
    }
  }
};

Controller.prototype.createSeries = function (series) {
  for (var i = 0; i < series.length; i++) {
    if (series[i].api && series[i].position && series[i].port) {
      this.createSerieComponent(series[i].api, series[i].port, series[i].position, series[i].url);
    }
  }
};

Controller.prototype.createCalendar = function (calendars) {
  for (var i = 0; i < calendars.length; i++) {
    if (calendars[i].position && calendars[i].maximumEntries && calendars[i].urls.length > 0) {
      this.createCalendarComponent(calendars[i].maximumEntries, calendars[i].urls, calendars[i].position);
    }
  }
};

Controller.prototype.createWeatherComponent = function (country, city, appID, position) {
  var element = this.getDivElement(position),
    windSun = document.createElement('div'),
    temp = document.createElement('div'),
    hourForecast = document.createElement('div'),
    forecast = document.createElement('div');

  //create elements with the right classes.
  windSun.setAttribute('class', 'windsun small dimmed');
  temp.setAttribute('class', 'temp');
  hourForecast.setAttribute('class', 'hour-forecast small dimmed');
  forecast.setAttribute('class', 'forecast small dimmed');

  //reset element
  element.innerHTML = '';
  element.appendChild(windSun);
  element.appendChild(temp);
  element.appendChild(hourForecast);
  element.appendChild(forecast);

  new Weather({country: country, city: city, appID: appID, div: element});
};

Controller.prototype.createTimeComponent = function (timeformat, displaySeconds, position) {
  var element = this.getDivElement(position);
  new Time({timeFormat: timeformat, displaySeconds: displaySeconds, div: element});
};

Controller.prototype.createSerieComponent = function (api, port, position, url) {
  var element = this.getDivElement(position);
  if (!url) {
    url = window.location.href.replace(window.location.pathname, '')
  }
  new Series({api: api, url: url, port: port, div: element});
};

Controller.prototype.createCalendarComponent = function (maximum, urls, position) {
  var element = this.getDivElement(position);
  new Calendar({div: element, calendars: urls, maxAmount: maximum});
};

Controller.prototype.getDivElement = function(position) {
  var element;
  if (position == 'top left') {
    element = document.getElementsByClassName(position);
  }
  if (position == 'top right') {
    element = document.getElementsByClassName(position);
  }
  if (position == 'bottom left') {
    element = document.getElementsByClassName(position);
  }
  if (position == 'bottom right') {
    element = document.getElementsByClassName(position);
  }
  if (position == 'center') {
    element = document.getElementsByClassName(position);
  }
  return element[0];
};

Controller.prototype.checkConfig = function () {
  var newConfig = this.getServerConfig(),
    usedConfig = this.getConfig();
  if (newConfig != usedConfig) {
    window.location.reload();
  }
};

Controller.prototype.getServerConfig = function () {
  var ajaxCaller = new AjaxRequest();
  if (ajaxCaller) {
    ajaxCaller.open('GET', 'config.js', false);
    ajaxCaller.send();
    return ajaxCaller.responseText;
  }
};

Controller.prototype.setConfig = function (config) {
  this.config = config;
};

Controller.prototype.getConfig = function () {
  return this.config;
};