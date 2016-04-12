/**
 * Created by Tim Mulders on 11-04-16.
 */
function Weather(config) {
  this.init(config);
}

/**
 * initializes the weather tab.
 * @param config {{country: String, city: String, appID: int}}
 */
Weather.prototype.init = function (config) {
  var me = this;
  this.setCountry(config.country);
  this.setCity(config.city);
  this.setAppID(config.appID);
  this.setElement(config.div);
  if (this.getElement()) {
    this.createParam();
    setInterval(function () {
      me.refreshWeather();
      me.refreshWeatherForecast();
      me.refreshHourForecast();
    }, 6000);
    this.refreshWeather();
    this.refreshWeatherForecast();
    this.refreshHourForecast();
  }
};

Weather.prototype.createParam = function () {
  this.setParam({
    APPID: this.getAppID(),
    lang: 'nl',
    q: this.getCity()+','+this.getCountry(),
    units: 'metric',
    cnt: 5
  });
};

/**
 * refreshes the current weather information.
 */
Weather.prototype.refreshWeather = function () {
  var me = this;
  $.ajax({
    data: this.getParam(),
    type: 'GET',
    dataType: 'json',
    url: 'http://api.openweathermap.org/data//2.5/weather',
    success: function (response) {
      var temperature = me.roundValue(response.main.temp),
        minimalTemp = me.roundValue(response.main.temp_min),
        maximalTemp = me.roundValue(response.main.temp_max),
        windSpeed = me.roundValue(response.wind.speed*3.6),
        iconClass = me.getIconObject()[response.weather[0].icon],
        sunrise = response.sys.sunrise,
        sunset = response.sys.sunset,
        currentTempHtml = me.createCurrentWeatherHTML({
          temperature: temperature,
          iconClass: iconClass
        }),
        windHtml = me.createWindHTML({
          windSpeed: windSpeed
        }),
        sunHtml = me.createSunHTML({
          sunset: sunset,
          sunrise: sunrise
        });

      me.updateHTML(currentTempHtml, '.temp');
      me.updateHTML(windHtml + sunHtml, '.windsun');
    }, //todo: kijken of hier niet .bind(this) bij moet..
    error: function (error) {
      console.log('error occured at current weather: '+error);
    }
  });
};

/**
 * refreshes the weather forecast.
 */
Weather.prototype.refreshWeatherForecast = function () {
  var me = this;
  $.ajax({
    data: this.getParam(),
    type: 'GET',
    dataType: 'json',
    url: 'http://api.openweathermap.org/data//2.5/forecast/daily',
    success: function (response) {
      var opacity = 1,
        table = '<table class="forecast-table">';
      for (var i = 0; i < response.list.length; i++) {
        table += me.createForecastRow(response.list[i], opacity);
        opacity -= 0.155;
      }
      table += '</table>';
      me.updateHTML(table, '.forecast');
    },
    error: function (error) {
      console.log('error ocured at weather forecast: '+error);
    }
  });
};

Weather.prototype.refreshHourForecast = function () {
  var me = this;
  $.ajax({
    data: this.getParam(),
    type: 'GET',
    dataType: 'json',
    url: 'http://api.openweathermap.org/data//2.5/forecast/',
    success: function (response) {
      var opacity = 1,
        table = '<div class="hourforecast-table">';
      for (var i = 1; i < response.list.length && i < 7; i++) {
        table += me.createHourForecastRow(response.list[i], opacity);
        opacity -= 0.155;
      }
      table += '</div>';
      me.updateHTML(table, '.hour-forecast');
    },
    error: function (error) {
      console.log('error ocured at weather forecast: '+error);
    }
  });
};

/**
 * Creates the HTML for the temperature.
 * @param info {{iconClass: String, temperature: int}} The info that needs to be placed.
 * @returns {string} The new HTML that needs to be placed.
 */
Weather.prototype.createCurrentWeatherHTML = function (info) {
  var icon = '<span class="icon ' + info.iconClass + ' dimmed wi"></span>',
    currentWeather = icon + info.temperature + '&deg;';
  return currentWeather;
};

/**
 * Creates the HTML for the windspeed.
 * @param info {{windSpeed: int}} The windspeed info.
 * @returns {string} The new HMTL that needs to be placed.
 */
Weather.prototype.createWindHTML = function (info) {
  return '<span class="wind"><span class="wi wi-strong-wind xdimmed"></span> '+ info.windSpeed +' km/h</span>';
};

/**
 * Creates the HTML for the sunrise and sunset info.
 * @param info {{sunset: int, sunrise: int}} The sunset and sunrise info.
 * @returns {string} The new HMTL that needs to be placed.
 */
Weather.prototype.createSunHTML = function (info) {
  var now = moment().format('HH:mm'),
    sunrise = moment(info.sunrise*1000).format('HH:mm'),
    sunset = moment(info.sunset*1000).format('HH:mm'),
    html = '<span class="sun"><span class="wi wi-sunrise xdimmed"></span> '+ sunrise +'</span>';
  if (sunrise < now && sunset > now) {
    html = '<span class="sun"><span class="wi wi-sunrise xdimmed"></span> '+ sunset +'</span>';
  }
  return html;
};

/**
 * creates a table row.
 * @param info {{clouds: int, deg: int, dt: int, humidity: int, pressure: float, speed: float, temp: {}, weather: []}}
 * @param opacity {int} The opacity of the row that is being created.
 * @returns {string} A table row.
 */
Weather.prototype.createForecastRow = function (info, opacity) {
  var day = '<td style="opacity:'+ opacity +'" class="day">'+ moment(info.dt, 'X').format('ddd') +'</td>',
    icon = '<td style="opacity:'+ opacity +'" class="icon-small '+ this.getIconObject()[info.weather[0].icon] +'"></td>',
    max = '<td style="opacity:'+ opacity +'" class="temp-max">'+ this.roundValue(info.temp.max) +'</td>',
    min = '<td style="opacity:'+ opacity +'" class="temp-min">'+ this.roundValue(info.temp.min) +'</td>';
  return '<tr>' + day + icon + max + min + '</tr>';
};

Weather.prototype.createHourForecastRow = function (info) {
  var hour = '<div class="hour">'+moment(info.dt, 'X').hour()+'</div>',
    icon = '<div class="icon-small '+this.getIconObject()[info.weather[0].icon]+'"></div>',
    temp = '<div class="hour-temp">'+ this.roundValue(info.main.temp)+'&deg;</div>';
  return '<div class="hour-forecast">' + hour + icon + temp + '</div>';
};

/**
 * Adds the HTML to the class, with a fade of 1000.
 * @param html {string} The new HTML as a string.
 * @param htmlClass {string} The class of the HTML element that needs to be updated.
 */
Weather.prototype.updateHTML = function (html, htmlClass) {
  $(this.getElement()).find(htmlClass).updateWithText(html, 1000);
};

Weather.prototype.roundValue = function (temperature) {
  return parseFloat(temperature).toFixed(1);
};


Weather.prototype.setCountry = function (country) {
  this.country = country
};

Weather.prototype.getCountry = function () {
  return this.country;
};

Weather.prototype.setCity = function (city) {
  this.city = city;
};

Weather.prototype.getCity = function () {
  return this.city;
};

Weather.prototype.setAppID = function (id) {
  this.appID = id;
};

Weather.prototype.getAppID = function () {
  return this.appID;
};

Weather.prototype.setParam = function (param) {
  this.param = param;
};

Weather.prototype.getParam = function () {
  return this.param;
};

Weather.prototype.setElement = function (element) {
  this.element = element;
};

Weather.prototype.getElement = function () {
  return this.element;
};

Weather.prototype.getIconObject = function () {
  return {
    '01d':'wi-day-sunny',
    '02d':'wi-day-cloudy',
    '03d':'wi-cloudy',
    '04d':'wi-cloudy-windy',
    '09d':'wi-showers',
    '10d':'wi-rain',
    '11d':'wi-thunderstorm',
    '13d':'wi-snow',
    '50d':'wi-fog',
    '01n':'wi-night-clear',
    '02n':'wi-night-cloudy',
    '03n':'wi-night-cloudy',
    '04n':'wi-night-cloudy',
    '09n':'wi-night-showers',
    '10n':'wi-night-rain',
    '11n':'wi-night-thunderstorm',
    '13n':'wi-night-snow',
    '50n':'wi-night-alt-cloudy-windy'
  };
};