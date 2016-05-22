'use strict';

(function() {

  var ngApp = angular.module('ngApp', ['ngMaterial', 'ngRoute']);

  ngApp.controller('SearchCtrl', ['$scope', '$http', '$q', '$log', '$mdUtil', function($scope, $http, $q, $log, $mdUtil) {

    var self = this;

    this.name        = 'SearchCtrl';
    this.states      = [];
    this.drug        = '';
    this.querySearch = querySearch;
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
            value: medication.name.toLowerCase(),
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

        $http({
          url: `/firebase/${item.value}`, 
          method: 'GET'
        })
        .success(function(json) {
          self.count = json[item.value];
        });

        $http({
          url: `https://rxnav.nlm.nih.gov/REST/Prescribe/drugs?name=${item.value}`,
          method: 'GET'
        })
        .success(function(json) {
          try {
            var drug = json.drugGroup.conceptGroup[1].conceptProperties[0].name;
            self.drug = drug;
         } catch (e) {
            $log.log(e);
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
                <p>Search for medication.</p>
                <p>After 3 characters live search will begin.</p>
                <md-autocomplete
                    md-selected-item="search.selectedItem"
                    md-search-text="search.searchText"
                    md-selected-item-change="search.selectedItemChange(item)"
                    md-items="item in search.querySearch(search.searchText)"
                    md-item-text="item.display"
                    md-min-length="3"
                    placeholder="Please write name of medication">
                  <md-item-template>
                    <span md-highlight-text="search.searchText" md-highlight-flags="^i">{{item.display}}</span>
                  </md-item-template>
                  <md-not-found>
                    No medications matching "{{search.searchText}}" were found.
                  </md-not-found>
                </md-autocomplete>
              </form>
              <br/>
              <table class="table table-bordered" ng-if="search.drug">
                <tr>
                  <td>Full name of selected medication</td>
                  <td>{{search.drug}}</td>
                </tr>
                <tr>
                  <td>Total times medication was requested</td>
                  <td>{{search.count}}</td>
                </tr>
              </table>
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
          <div ng-view></div>
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