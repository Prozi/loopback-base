'use strict';

(function () {

  var ngApp = angular.module('ngApp', ['ngRoute']);

  ngApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/home', {
          template: 'home',
          controller: 'DummyCtrl',
          controllerAs: 'home'
        })
        .when('/search', {
          template: 'search',
          controller: 'DummyCtrl',
          controllerAs: 'search'
        })
        .otherwise({
          redirectTo: '/home'
        });

      $locationProvider.html5Mode(true);
  }]);

  ngApp.controller('DummyCtrl', ['$routeParams', function($routeParams) {
    this.name = 'DummyCtrl';
    this.params = $routeParams;
  }]);

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
                <li><a href="/home">Home</a></li>
                <li><a href="/search">Search</a></li>
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
        <div id="body" class="container">
          <div ng-view>
            <p>App started :)</p>
          </div>
        </div>
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

})();