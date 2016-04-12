<html>
<head>
  <title>Magic mirror</title>
	<link rel="stylesheet" type="text/css" href="css/weather-icons.css">
	<link rel="stylesheet" type="text/css" href="css/font-awesome.css">
	<link rel="stylesheet" type="text/css" href="css/main.css">
	<!-- standard stuff -->
	<script src="js/libraries/jquery.js"></script>
  <script src="js/libraries/jquery.feedToJSON.js"></script>
  <script src="js/libraries/moment-with-locales.min.js"></script>
  <script src="js/libraries/ical_parser.js"></script>
  <script src="js/libraries/rrule.js"></script>
  <!-- config file -->
  <script src="config.js"></script>  
  <!-- scripts for different views -->
  <script src="js/time.js"></script>
  <script src="js/weather.js"></script>
  <script src="js/series.js"></script>
  <script src="js/calendar.js"></script>
  <script src="js/controller.js"></script>
</head>
<body onload="controller = new Controller()">
  
  <div class="top left"></div>
  <div class="top right">
<!--
  	<div class="windsun small dimmed"></div>
  	<div class="temp"></div>
  	<div class="forecast small dimmed"></div>
-->
  </div>
  <div class="center"></div>
  <div class="bottom left"></div>
  <div class="bottom right"></div>
</body>
</html>