function Time(config) {
  this.init(config);
}

Time.prototype.init = function (config) {
  var me = this;
  this.setTimeFormat(config.timeFormat);
  this.setDisplaySeconds(config.displaySeconds);
  this.setElement(config.div);
  if (this.getElement()) {
    this.refreshTime();
    setInterval(function () {
      me.refreshTime();
    }, 1000);
  }
};

Time.prototype.refreshTime = function () {
  var date = this.createDateElement(),
    time = this.createTimeElement();
  this.updateHTML($(date).prop('outerHTML') + $(time).prop('outerHTML'));
};

Time.prototype.createDateElement = function () {
  var date = moment(),
    dateElement = document.createElement('div'),
    dayElement = document.createElement('span'),
    longDateElement = document.createElement('span');
  dateElement.setAttribute('class', 'date small dimmed');

  dayElement.setAttribute('class', 'dayname');
  dayElement.innerHTML = date.format('dddd')+', ';

  longDateElement.setAttribute('class', 'longdate');
  longDateElement.innerHTML = date.format('LL');

  dateElement.appendChild(dayElement);
  dateElement.appendChild(longDateElement);
  return dateElement;
};

Time.prototype.createTimeElement = function () {
  var date = moment(),
    element = document.createElement('div');
  element.setAttribute('class', 'time');
  element.setAttribute('id', 'time');
  element.innerHTML = date.format(this.getTimeFormat()+':mm');
  if (this.getDisplaySeconds()) {
    var secElement = document.createElement('span');
    secElement.setAttribute('class', 'sec');
    secElement.innerHTML = date.format('ss');
    element.appendChild(secElement);
  }
  return element;
};

Time.prototype.updateHTML = function (html) {
  $(this.getElement()).html(html);
};


Time.prototype.setTimeFormat = function (format) {
  if (format == 'hh' || parseInt(format) == 12) {
    this.format = 'hh';
  }else {
    this.format = 'HH';
  }
};

Time.prototype.getTimeFormat = function () {
  return this.format;
};

Time.prototype.setDisplaySeconds = function (displaySeconds) {
  this.displaySeconds = displaySeconds;
};

Time.prototype.getDisplaySeconds = function () {
  return this.displaySeconds;
};

Time.prototype.setFade = function (fade) {
  this.fade = fade;
};

Time.prototype.getFade = function () {
  return this.fade;
};

Time.prototype.setElement = function (element) {
  this.element = element;
};

Time.prototype.getElement = function () {
  return this.element;
};
