var config = {
  lang: 'nl',
  
  time: [{
      timeFormat: 24,
      displaySeconds: true,
      position: 'top left'
  }], 
  
  weather: [{
      city: 'Nijmegen',
      country: 'Netherlands',
      appID: '', // API of OpenWeatherMap
      position: 'top right'
  }],
  
  series: [{
    api: '', // SickBeard API key. Can be found in the general settings
    port: '8081', // standard SickBeard port
    position: 'bottom left',
    url: '' // optional, if not used you should delete it.
  }],
  
  calendar: [{
    position: 'bottom right',
    maximumEntries: 10, // Total Maximum Entries
    urls: [
      { // Fontawsome Symbol see http://fontawesome.io/cheatsheet/
        symbol: 'fa-book', //school
        url: '' // url of the calendar
      },
      {
        symbol: 'fa-suitcase', //work
        url: '' // url of the calendar
      },
      {
        symbol: 'fa-home', //home
        url: '' // url of the calendar
      }
    ]
  }],
  
  trello: [{
      position: 'bottom left',
      name: 'Todo:',
      api: '', //site: https://trello.com/app-key
      refreshTime: 60, // In seconds; default 60 seconds
      maxAmount: 10
    }]
}
