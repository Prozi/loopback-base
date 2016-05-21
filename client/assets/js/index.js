'use strict';

(function() {

  var ngApp = angular.module('ngApp', ['ngMaterial', 'ngRoute']);

  ngApp.controller('SearchCtrl', ['$http', '$q', '$log', function($http, $q, $log) {

    var self = this;

    self.name        = 'SearchCtrl';
    self.isDisabled  = false;
    self.states      = [];
    self.querySearch = querySearch;
    self.selectedItemChange = selectedItemChange;

    function getApi(query) {
      var deferred = $q.defer();
      $http({
        url: query, 
        method: 'GET'
      })
      .success(function(json) {
        deferred.resolve(json.map(function(medication) {
          return {
            value: medication.name.toLowerCase(),
            display: medication.name
          };
        })); 
      });
      return deferred.promise;
    }

    function querySearch (query) {
      return getApi('/api/Medications?filter[where][name][regexp]=' + `/${query}/i`);
    }

    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
    }

  }]);

  ngApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/home', {
          template: 'home',
          controller: 'DummyCtrl',
          controllerAs: 'home'
        })
        .when('/search', {
          template: `
            <md-content class="md-padding">
              <form ng-submit="$event.preventDefault()">
                <p>Search for medication.</p>
                <md-autocomplete
                    ng-disabled="search.isDisabled"
                    md-no-cache="search.noCache"
                    md-selected-item="search.selectedItem"
                    md-search-text-change="search.searchTextChange(search.searchText)"
                    md-search-text="search.searchText"
                    md-selected-item-change="search.selectedItemChange(item)"
                    md-items="item in search.querySearch(search.searchText)"
                    md-item-text="item.display"
                    md-min-length="0"
                    placeholder="Please write name of medication">
                  <md-item-template>
                    <span md-highlight-text="search.searchText" md-highlight-flags="^i">{{item.display}}</span>
                  </md-item-template>
                  <md-not-found>
                    No medications matching "{{search.searchText}}" were found.
                  </md-not-found>
                </md-autocomplete>
              </form>
            </md-content>
          `,
          controller: 'SearchCtrl',
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

  ngApp.directive('appbody', function() {
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