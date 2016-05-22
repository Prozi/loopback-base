'use strict';

(function() {

  var ngApp = angular.module('ngApp', ['ngMaterial', 'ngRoute']);

  ngApp.controller('SearchCtrl', ['$scope', '$http', '$q', '$log', '$mdUtil', function($scope, $http, $q, $log, $mdUtil) {

    var self = this;

    this.name        = 'SearchCtrl';
    this.medication  = '';
    this.noImage     = '/assets/img/no-image.png';
    this.picture     = this.noImage;
    this.querySearch = querySearch;
    this.noFireBase  = false;
    this.noRxImage   = false;
    this.noRxNav     = false;
    this.selectedItemChange = selectedItemChange;

    $scope.$on('$destroy', function() {
      $mdUtil.enableScrolling();
    });

    function getApi(query) {
      var deferred = $q.defer();
      $http({
        url: query, 
        method: 'GET'
      })
      .success(function(json) {
        deferred.resolve(json.map(function(medication) {
          return {
            value  : medication.name.toLowerCase(),
            display: medication.name
          };
        })); 
      });
      return deferred.promise;
    }

    function querySearch (query) {
      return getApi(`/api/Medications?filter[where][name][regexp]=/${query}/i`);
    }

    function selectedItemChange(item) {
      if (item && item.value) {

        // Update firebase counter
        $http({
          url: `/firebase/${item.display}`, 
          method: 'GET'
        })
        .success(function(json) {
          console.log(json);
          self.count = json[Object.keys(json)[0]];
        })
        .error(function(data) {
          self.count = '';
          console.log('firebase', data.error.status);
          if (data.error.status === 404) {
            self.noFireBase = true;
          }
        });

        // Get more information
        $http({
          url: `https://rxnav.nlm.nih.gov/REST/Prescribe/drugs?name=${item.value}`,
          method: 'GET'
        })
        .success(function(json) {
          if (json.drugGroup) {
            if (json.drugGroup.conceptGroup) {
              self.medication = json.drugGroup.conceptGroup[1].conceptProperties[0].name;
            } else if (json.drugGroup.name) {
              self.medication = item.display;
            }
          }
        })
        .error(function(data) {
          self.medication = null;
          console.log('rxnav', data.error.status);
          if (data.error.status === 404) {
            self.noRxNav = true;
          }
        });

        $http({
          url: `http://rximage.nlm.nih.gov/api/rximage/1/rxnav?name=${item.value}&resolution=600`,
          method: 'GET'
        })
        .success(function(json) {
          if (json.nlmRxImages && json.nlmRxImages.length) {
            self.picture = json.nlmRxImages[0].imageUrl;
          } else {
            self.picture = self.noImage;
          }
        })
        .error(function(data) {
          self.picture = self.noImage;
          console.log('rximage', data.error.status);
          if (data.error.status === 404) {
            self.noRxImage = true;
          }
        });

      }
    }

  }]);

  ngApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/home', {
          template: `
            <md-content class="md-padding">
              <p>Welcome</p>
              <p>Click search in navbar to search for medications.</p>
            </md-content>
          `,
          controller: 'DummyCtrl',
          controllerAs: 'home'
        })
        .when('/search', {
          template: `
            <md-content class="md-padding">
              <form ng-submit="$event.preventDefault()">
                <md-autocomplete
                    md-selected-item="search.selectedItem"
                    md-search-text="search.searchText"
                    md-selected-item-change="search.selectedItemChange(item)"
                    md-items="item in search.querySearch(search.searchText)"
                    md-item-text="item.display"
                    md-min-length="2"
                    placeholder="Please write name of medication">
                  <md-item-template>
                    <span md-highlight-text="search.searchText" md-highlight-flags="^i">{{item.display}}</span>
                  </md-item-template>
                  <md-not-found>
                    No medications matching "{{search.searchText}}" were found.
                  </md-not-found>
                </md-autocomplete>
              </form>
              <div class="medication hidden-xs" ng-if="search.medication">
                <a href="{{search.picture}}" target="_blank" ng-if="!search.noRxImage" class="medication-picture">
                  <img width="100%" ng-src="{{search.picture}}" alt="picture"/>
                </a>
                <div>
                  <h2 class="medication-name" ng-if="!search.noRxNav">
                    {{search.medication}}
                  </h2>
                  <p ng-if="!search.noFireBase">
                    <small>requested: {{search.count}}x times</small>
                  </p>
                </div>
              </div>
              <div class="medication visible-xs" ng-if="search.medication">
                <h2 class="medication-name" ng-if="!search.noRxNav">
                  {{search.medication}}
                </h2>
                <p ng-if="!search.noFireBase">
                  <small>requested: {{search.count}}x times</small>
                </p>
                <a href="{{search.picture}}" target="_blank" ng-if="!search.noRxImage" class="medication-picture">
                  <img width="100%" ng-src="{{search.picture}}" alt="picture"/>
                </a>
              </div>
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
        <div id="body">
          <div class="container">
            <div ng-view></div>
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