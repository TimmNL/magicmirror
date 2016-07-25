/**
 * Created by Tim Mulders on 11-04-16.
 */
/**
 * Displays and updates the calander.
 * @param config {{div: Element, calendars: [{url: String, symbol: String}], maxAmount: int}}
 * @constructor
 */
function Calendar(config){
  this.init(config);
}

/**
 *
 * @param config
 */
Calendar.prototype.init = function (config) {
  this.setCalendars(config.calendars);
  this.setMaxAmount(config.maxAmount);
  this.setElement(config.div);
  this.refreshCalendar();
};

Calendar.prototype.refreshCalendar = function () {
  this.setEvents([]);
  this.setCurrentUrl(this.getCalendars()[0].url);
  this.setCurrentSymbol(this.getCalendars()[0].symbol);
  this.refreshEvents();
};

Calendar.prototype.refreshEvents = function () {
  var me = this,
    url = this.getCurrentUrl();
  new ical_parser('php/calendar.php?url='+encodeURIComponent(url), function (result) {
    var events = me.convertEvents(result.getEvents());
    me.addEvents(events);
    if (me.nextCalendar()) {
      me.refreshEvents();
    }else{
      me.updateCalendar();
      setTimeout(function () {
        me.refreshCalendar();
      }, 60000); // minute
    }
  });
};

/**
 * Sets the current url to the url of the next calendar in the list.
 * @returns {boolean} True if the next calendar is selected, False if there is no next calendar.
 */
Calendar.prototype.nextCalendar = function () {
  var calendars = this.getCalendars();
  for (var i = 0; i < calendars.length-1; i++) {
    if (calendars[i].url === this.getCurrentUrl()) {
      this.setCurrentUrl(calendars[i+1].url);
      this.setCurrentSymbol(calendars[i+1].symbol);
      return true;
    }
  }
  return false;
};

/**
 * Converts the given data to readable objects.
 * @param events iCloud or Google calendar data.
 * @return a readable event array.
 */
Calendar.prototype.convertEvents = function (events) {
  var url = this.getCurrentUrl(),
    endList = [];

  for (var i = 0; i < events.length; i++) {
    var event = events[i],
      description = event.SUMMARY,
      startDate, endDate,
       seconds, endSeconds,
      timeLeft;

    // search for the dates
    for (var key in event) {
      var value = event[key],
        seperatorPlace = key.search(';');

      // check if the variable is the start or end date of the event
      if (seperatorPlace >= 0) {
        var mainKey = key.substring(0, seperatorPlace), // 'DTSTART' or 'DTEND'
          subKey = key.substring(seperatorPlace+1), // 'VALUE=DATE'
          date;

        //convert date string to actual date
        if (subKey == 'VALUE=DATE') { //iCloud
          date = new Date(
            value.substring(0,4), // year
            value.substring(4,6) - 1,// month
            value.substring(6,8));// day
        }else {                      //Google
          date = new Date(
            value.substring(0,4),    //
            value.substring(4,6) - 1,//
            value.substring(6,8),    //
            value.substring(9,11),   //
            value.substring(11,13),  //
            value.substring(13,15)); //
        }

        //set date to the variable
        if (mainKey == 'DTSTART') {
          event.startDate = startDate = date;
        }
        if (mainKey == 'DTEND') {
          event.endDate = endDate = date;
        }
        if (mainKey == 'SUMMARY') {
          description = value;
        }
      }
    }

    if (startDate && endDate) { // get the time left till event
      seconds = moment(startDate).diff(moment(), 'seconds');
      startDate = moment(startDate);

      endSeconds = moment(endDate).diff(moment(), 'seconds');
      endDate = moment(endDate);
    }

    if (seconds >=0) {
      if (seconds <= 18000 || seconds >= 172800) {
        timeLeft = this.replaceWeirdSymbols(moment(startDate).fromNow());
      }else {
        timeLeft = this.replaceWeirdSymbols(moment(startDate).calendar());
      }
      endList.push({
        description: description,
        days: timeLeft,
        seconds: seconds,
        url: url,
        symbol: this.getCurrentSymbol()
      });
    }else if (endSeconds > 0) {
      if (endSeconds <= 18000 || endSeconds >= 172800) {
        timeLeft = moment(endDate).fromNow(true);
      }else {
        timeLeft = moment(endDate).calendar();
      }
      endList.push({
        description: description,
        days: timeLeft,
        seconds: seconds,
        url: url,
        symbol: this.getCurrentSymbol()
      });
      seconds = endSeconds;
    }

    if (event.RRULE) {
      var options = new RRule.parseString(event.RRULE),
        rule, dates, oneYear = new Date();
      options.dtstart = event.startDate;
      rule = new RRule(options);
      oneYear.setFullYear(oneYear.getFullYear()+1);
      dates = rule.between(new Date(), oneYear, true, function (date, i) {
        return i<10;
      });

      for (date in dates) {
        var dt = new Date(dates[date]);
        seconds = moment(dt).diff(moment(), 'seconds');
        startDate = moment(dt);
        if (seconds >=0) {
          if (seconds <= 18000 || seconds >= 172800) {
            timeLeft = this.replaceWeirdSymbols(moment(dt).fromNow());
          }else {
            timeLeft = this.replaceWeirdSymbols(moment(dt).calendar());
          }
          endList.push({
            description: description,
            days: timeLeft,
            seconds: seconds,
            url: url,
            symbol: this.getCurrentSymbol()
          });
        }
      }
    }
  }

  return endList;
};

Calendar.prototype.updateCalendar = function () {
  var events = this.getEvents(),
    opacity = 1, isNew = true,
    table = '<table class="xsmall calendar-table">';
  events = events.sort(function(a,b){return a.seconds- b.seconds});
  events = events.slice(0, this.getMaxAmount());

  if ($(this.getElement()).find('.calendar-table').length) {
    isNew = false;
  }

  for (var i = 0; i < events.length; i++) {
    var event = events[i],
      row = '<tr class="event" id="event'+i+'" style="opacity: '+opacity+'">',
      symbol = '<td class="fa '+event.symbol+' calendar-icon"></td>',
      description = '<td class="description">'+event.description+'</td>',
      left = '<td class="days dimmed">'+event.days+'</td>';
    row += symbol + description + left + '</tr>';
    table += row;

    if (!isNew && $(this.getElement()).find('#event'+i).length) {
      this.updateRowInElementHTML('#event'+i, symbol + description + left);
    }else {
      isNew = true;
    }
    opacity -= 1 / events.length;
  }

  if (isNew) {
    table += '</table>';
    this.updateElementHTML(table);
  }
};

Calendar.prototype.replaceWeirdSymbols = function (string) {
  return string.replace(/Ã©/g, '&#233;');
};

Calendar.prototype.addEvents = function (events) {
  this.setEvents(this.getEvents().concat(events));
};

Calendar.prototype.updateElementHTML = function (html) {
  $(this.getElement()).updateWithText(html, 1000);
};

Calendar.prototype.updateRowInElementHTML = function (row, html) {
  $(this.getElement()).find(row).updateWithText(html, 1000);
};


Calendar.prototype.setElement = function (element) {
  this.element = element;
};

Calendar.prototype.getElement = function () {
  return this.element;
};

Calendar.prototype.setEvents = function (events) {
  this.events = events;
};

Calendar.prototype.getEvents = function () {
  return this.events;
};

Calendar.prototype.setCalendars = function (calendars) {
  this.calendars = calendars;
};

Calendar.prototype.getCalendars = function () {
  return this.calendars;
};

Calendar.prototype.setCurrentUrl = function (url) {
  this.url = url;
};

Calendar.prototype.getCurrentUrl = function () {
  return this.url;
};

Calendar.prototype.setCurrentSymbol = function (symbol) {
  this.symbol = symbol;
};

Calendar.prototype.getCurrentSymbol = function () {
  return this.symbol;
};

Calendar.prototype.setMaxAmount = function (maxAmount) {
  this.maxAmount = maxAmount;
};

Calendar.prototype.getMaxAmount = function () {
  return this.maxAmount;
};