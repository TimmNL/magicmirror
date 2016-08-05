/**
 * Created by Tim on 28-07-16.
 */
function TrelloDues(config) {
  this.init(config);
}

TrelloDues.prototype.init = function (config) {
  var me = this;
  this.setApiKey(config.api);
  this.setBoards(config.boards);
  this.setMaxAmount(config.maxAmount);
  this.setElement(config.div);
  this.setName(config.name ? config.name : '');
  this.setRefreshTime(config.refreshTime ? config.refreshTime*1000 : 60000); // default minute
  this.loadTrelloScript(function () {
    if (Trello) {
      me.authorize();
    }
  });
};

TrelloDues.prototype.loadTrelloScript = function (callback) {
  var scriptElement = document.createElement('script');
  scriptElement.type = 'text/javascript';

  if (scriptElement.readyState){  //IE
    scriptElement.onreadystatechange = function () {
      if (scriptElement.readyState == "loaded" || scriptElement.readyState == "complete") {
        scriptElement.onreadystatechange = null;
        callback();
      }
    };
  } else {  //Others
    scriptElement.onload = function(){
      callback();
    };
  }
  scriptElement.src = 'https://api.trello.com/1/client.js?key='+this.getApiKey();
  document.getElementsByTagName('head')[0].appendChild(scriptElement);
};

TrelloDues.prototype.authorize = function () {
  var me = this;
  Trello.authorize({
    name: this.getName(),
    interactive: false,
    expiration: "never",
    success: function () {
      me.requestUserID(function () {
        me.refreshCards();
        me.getDueCards();
      });
    },
    error: function () {
      me.fail();
    },
    scope: { write: false, read: true }
  });
};

TrelloDues.prototype.requestUserID = function (callback) {
  var me = this;
  Trello.members.get('me', function (member) {
    me.setTrelloUserID(member.id);
    if (callback) {
      callback();
    }
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
  var me = this, resource = '/members/' + this.getTrelloUserID() + '/cards';
  Trello.get(resource, function (cards) {
    cards = me.filterCards(cards);
    me.processCards(cards);
  });
};

TrelloDues.prototype.processCards = function (cards) {
  var result = [], me = this;
  for (var i = 0; i < cards.length; i++) {
    var card = {
      title: cards[i].name,
      seconds: moment(cards[i].due).diff(moment(), 'seconds'),
      timeLeft: this.replaceWeirdSymbols(moment(cards[i].due).fromNow()) //todo: overgebleven tijd berekenen met moment()
    };
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
    if (!cards[i].closed && cards[i].due) {
      result.push(cards[i]);
    }
  }
  return result;
};

TrelloDues.prototype.getBoardName = function (card, boardName, callback) {
  Trello.get('/boards/'+ boardName +'/', function (board) {
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

TrelloDues.prototype.getApiKey = function () {
  return this.api;
};

TrelloDues.prototype.setApiKey = function (api) {
  this.api = api;
};

TrelloDues.prototype.setBoards = function (boards) {
  this.boards = boards;
};

TrelloDues.prototype.getBoards = function () {
  return this.boards;
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

TrelloDues.prototype.setTrelloUserID = function (id) {
  this.trelloUserID = id;
};

TrelloDues.prototype.getTrelloUserID = function () {
  return this.trelloUserID;
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