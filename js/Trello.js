/**
 * Created by Tim on 28-07-16.
 */
function TrelloDues(config) {
  this.init(config);
}

TrelloDues.prototype.init = function (config) {
  this.setApiKey(config.api);
  this.setToken(config.token);
  this.setMaxAmount(config.maxAmount);
  this.setShowAllAssigned(config.all ? config.all : false);
  this.setElement(config.div);
  this.setName(config.name ? config.name : '');
  this.setRefreshTime(config.refreshTime ? config.refreshTime*1000 : 60000); // default minute
  this.authorize();
};

TrelloDues.prototype.authorize = function () {
  var me = this;
  this.ajaxCall([{name: 'action', value:'authorize'}], function () {
    me.refreshCards();
  },
  function (e) {
    me.fail();
  });
};

TrelloDues.prototype.fail = function () {
  this.updateElementHTML('<span class="title">Authorisation failed</span>');
};

TrelloDues.prototype.refreshCards = function () {
  var me = this;
  this.setCards([]);
  this.getDueCards();
  setTimeout(function () {
    me.refreshCards();
  }, this.getRefreshTime());
};

TrelloDues.prototype.getDueCards = function () {
  var me = this;
  this.ajaxCall([{name: 'action', value:'getCards'}], function (result) {
    me.processCards(result);
  });
};

TrelloDues.prototype.processCards = function (cards) {
  var result = [], me = this;
  cards = this.filterCards(cards);
  for (var i = 0; i < cards.length; i++) {
    var card = {
      title: cards[i].name,
      seconds: moment(cards[i].due).diff(moment(), 'seconds'),
      timeLeft: this.replaceWeirdSymbols(moment(cards[i].due).fromNow())
    };
    if (this.getShowAllAssigned() && !cards[i].due) {
      card.timeLeft = '';
    }

    this.getBoardName(card, cards[i].idBoard, function (cardWithBoard) {
      result.push(cardWithBoard);
      if (result.length == cards.length) {
        result = result.sort(function (a, b) {return a.seconds - b.seconds});
        result = result.slice(0, me.getMaxAmount());
        me.setCards(result);
        me.createTrelloBoard();
      }
    });
  }
  if (cards.length == 0) {
    var board = '<span class="title">' + this.getName() + '</span>' +
                '<table class="xsmall trello-table">',
      content = '<td class="card-title">No cards!</td>';
    board += '<tr class="event" id="card0" style="opacity:1;">' +
      content +
      '</tr>';
    if ($(this.getElement()).find('#card0').length) {
      this.updateRowInElementHTML('#card0', content);
    }else {
      board += '</table>';
      this.updateElementHTML(board);
    }
  }
};

TrelloDues.prototype.filterCards = function (cards) {
  var result = [];
  for (var i = 0; i < cards.length; i++) {
    var seconds = moment(cards[i].due).diff(moment(), 'seconds');
    if (!cards[i].closed && ((cards[i].due && seconds > 0)|| (this.getShowAllAssigned() && !cards[i].due))) {
      result.push(cards[i]);
    }
  }
  return result;
};

TrelloDues.prototype.getBoardName = function (card, boardName, callback) {
  this.ajaxCall([{name: 'action', value: 'getBoardName'}, {name: 'board_id', value: boardName}], function (board) {
    card.board = board.name;
    if (callback) {
      callback(card);
    }
  });
};

TrelloDues.prototype.createTrelloBoard = function () {
  var isNew = true, cards = this.getCards(), opacity = 1,
    board = '<span class="title">' + this.getName() + '</span>' +
            '<table class="xsmall trello-table">';

  if ($(this.getElement()).find('.calendar-table').length) {
    isNew = false;
  }

  for (var i = 0; i < cards.length; i++) {
    var content = '<td class="card-title">'+cards[i].title+' ['+cards[i].board+']</td>' +
                  '<td class="days dimmed">'+cards[i].timeLeft+'</td>';

    board += '<tr class="event" id="card'+i+'" style="opacity: '+opacity+';">' +
                content +
              '</tr>';

    if (!isNew && $(this.getElement()).find('#card'+i).length) {
      this.updateRowInElementHTML('#card'+i, content);
    }else {
      isNew = true;
    }

    opacity -= 1 / cards.length;
  }

  if (isNew) {
    board += '</table>';
    this.updateElementHTML(board);
  }
};

TrelloDues.prototype.updateElementHTML = function (html) {
  $(this.getElement()).updateWithText(html, 1000);
};

TrelloDues.prototype.updateRowInElementHTML = function (row, html) {
  $(this.getElement()).find(row).updateWithText(html, 1000);
};

TrelloDues.prototype.replaceWeirdSymbols = function (string) {
  return decodeURIComponent(escape(string));
  //return string.replace(/Ã©/g, '&#233;');
};

TrelloDues.prototype.ajaxCall = function (args, callback, error) {
  var url = window.location.href + 'php/Trello.php?';
  args.push({name: 'token', value: this.getToken()});
  args.push({name: 'key', value: this.getApiKey()});
  for (var i = 0; i < args.length; i++) {
    url += args[i].name+'='+args[i].value+'&';
  }
  url = url.substr(0, url.length-1);
  $.ajax({
    type: 'GET',
    contentType: 'json',
    dataType: 'json',
    async: false,
    url: url,
    success: function (result) {
      callback(result);
    },
    error: function (e) {
      if (error) {
        error(e);
      }
    }
  });
};

TrelloDues.prototype.getApiKey = function () {
  return this.api;
};

TrelloDues.prototype.setApiKey = function (api) {
  this.api = api;
};

TrelloDues.prototype.getToken = function () {
  return this.token;
};

TrelloDues.prototype.setToken = function (token) {
  this.token = token;
};

TrelloDues.prototype.getShowAllAssigned = function () {
  return this.all;
};

TrelloDues.prototype.setShowAllAssigned = function (all) {
  this.all = all;
};

TrelloDues.prototype.setCards = function (cards) {
  this.cards = cards;
};

TrelloDues.prototype.getCards = function () {
  return this.cards;
};

TrelloDues.prototype.setName = function (name) {
  this.name = name;
};

TrelloDues.prototype.getName = function () {
  return this.name;
};

TrelloDues.prototype.setMaxAmount = function (maxAmount) {
  this.maxAmount = maxAmount;
};

TrelloDues.prototype.getMaxAmount = function () {
  return this.maxAmount;
};

TrelloDues.prototype.setElement = function (element) {
  this.element = element;
};

TrelloDues.prototype.getElement = function () {
  return this.element;
};

TrelloDues.prototype.setRefreshTime = function (refreshTime) {
  this.refreshTime = refreshTime;
};

TrelloDues.prototype.getRefreshTime = function () {
  return this.refreshTime;
};