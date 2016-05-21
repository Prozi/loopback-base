'use strict';

var ngApp = angular.module('ngApp', []);

ngApp.directive('navbar', function() {
  return {
    template: `
      <nav class="navbar navbar-default navbar-fixed-top">
        <div class="container">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand">
              <img alt="LoopBack Base" src="favicon.ico">
            </a>
          </div>
          <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
              <li><a ng-route="home">Home</a></li>
              <li><a ng-route="search">Search</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </nav>
    `    
  };
});

ngApp.directive('appbody', function () {
  return {
  	template: `
  	  <p id="body" class="container">App started :)</p>
  	`
  }
});

ngApp.directive('app', function() {
  return {
    template: `
      <navbar></navbar>
      <appbody></appbody>
    `
  };
});

angular.element(document).ready(function() {
  angular.bootstrap(document, ['ngApp']);
});