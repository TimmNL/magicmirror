/**
 * Created by Tim Mulders on 08-04-16.
 */
function Series(config) {
  this.init(config);
}

Series.prototype.init = function (config) {
  this.setUrl(config.url);
  this.setApiKey(config.api);
  this.setPort(config.port);
  this.setElement(config.div);
  this.setAiredEpisodes([]);
  this.getShows();
};

Series.prototype.getShows = function () {
  var me = this,
    xhr = $.ajax({
    type: 'GET',
    contentType: 'jsonp',
    dataType: 'jsonp',
    async: false,
    url: this.getUrl()+':'+this.getPort()+'/api/'+this.getApiKey()+'/?cmd=shows',
    success: function (response) {
      var i = 0;
      for (var property in response.data) {
        me.getLastAiredEpisode(property, response.data[property].show_name);
        i++;
      }
      me.setCheckedShows(0);
      me.setTotalShows(i);
      xhr.abort();
      response = null;
      xhr = null;
    },
    error: function () {
      me.getShows();
    }
  });
};

Series.prototype.getLastAiredEpisode = function (showId, showName) {
  var me = this;
  $.ajax({
    type: 'GET',
    contentType: 'jsonp',
    dataType: 'jsonp',
    async: false,
    url: this.getUrl()+':'+this.getPort()+'/api/'+this.getApiKey()+'/?cmd=show.seasons&tvdbid='+showId,
    success: function (response) {
      for (var property in response.data) {
        me.getYesterdaysAiredEpisode(response.data[property], showName);
      }
      me.setCheckedShows(me.getCheckedShows()+1);
      me.displayShows();
    },
    error: function () {
      me.getLastAiredEpisode(showId, showName);
    }
  });
};

Series.prototype.getYesterdaysAiredEpisode = function (seasonObject, showName) {
  var yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
  for (var property in seasonObject) {
    var episode = seasonObject[property];
    if (episode.airdate == yesterday) {
      this.addAiredEpisode(episode, showName);
    }
  }
};

Series.prototype.addAiredEpisode = function (episode, showName) {
  var aired = {
    show: showName,
    episode: episode.name,
    status: episode.status
  };
  this.getAiredEpisodes().push(aired);
};

Series.prototype.displayShows = function () {
  if (this.getCheckedShows() == this.getTotalShows()) {
    var episodes = this.getAiredEpisodes(),
      element = '<table class="series">',
      me = this;
    for (var i = 0; i < episodes.length; i++) {
      element += this.createShowElement(episodes[i]);
    }
    element += '</table>';
    this.updateHTML(element);
    setTimeout(function () {
      me.setAiredEpisodes([]);
      me.getShows();
    }, 10000);
    //todo: display shows
  }
};

Series.prototype.createShowElement = function (episode) {
  var show = '<td class="show-name">'+episode.show+'</td>',
    status = '<td class="show-status"><span class="fa '+this.getIconObject()[episode.status]+'"></span></td>';

  return '<tr class="show">'+show+status+'</tr>';
};

Series.prototype.updateHTML = function (html) {
  $(this.getElement()).updateWithText(html, 1000);
};

Series.prototype.setAiredEpisodes = function (airedEpisodes) {
  this.airedEpisodes = airedEpisodes;
};

Series.prototype.getAiredEpisodes = function () {
  return this.airedEpisodes;
};

Series.prototype.setElement = function (element) {
  this.element = element;
};

Series.prototype.getElement = function () {
  return this.element;
};

Series.prototype.setUrl = function (url) {
  this.url = url;
};

Series.prototype.getUrl = function () {
  return this.url;
};

Series.prototype.setApiKey = function (api) {
  this.api = api;
};

Series.prototype.getApiKey = function () {
  return this.api;
};

Series.prototype.setPort = function (port) {
  this.port = port;
};

Series.prototype.getPort = function () {
  return this.port;
};

Series.prototype.setTotalShows = function (totalShows) {
  this.totalShows = totalShows;
};

Series.prototype.getTotalShows = function () {
  return this.totalShows;
};

Series.prototype.setCheckedShows = function (checkedShows) {
  this.checkedShows = checkedShows;
};

Series.prototype.getCheckedShows = function () {
  return this.checkedShows;
};

Series.prototype.getIconObject = function () {
  return {
    'Archived': 'fa-check-circle-o',
    'Downloaded': 'fa-check-circle-o',
    'Wanted': 'fa-search',
    'Skipped': 'fa-ban',
    'Ingored': 'fa-ban',
    'Snatched': 'fa-download'
  };
};