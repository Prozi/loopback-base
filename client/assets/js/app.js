'use strict';

(() => {

  let ngApp = angular.module('ngApp', ['ngMaterial', 'ngRoute']);

  ngApp.controller('StatsCtrl', ['$scope', '$http', '$q', function ($scope, $http, $q) {

    const httpGet = (query) => 
      $http({ 
        url    : query, 
        method : 'GET' 
      });

    httpGet(`/firebase`)
      .success((json) => {
        $scope.stats = json;
      });

  }]);

  ngApp.controller('SearchCtrl', ['$scope', '$http', '$q', '$log', '$mdUtil', '$window', function ($scope, $http, $q, $log, $mdUtil, $window) {

    let self = this;

    this.name        = 'SearchCtrl';
    this.medication  = '';
    this.noPicture   = '/assets/img/no-image.png';
    this.picture     = this.noPicture;
    this.noFireBase  = false;
    this.noRxImage   = false;
    this.noRxNav     = false;
    this.count       = 0;

    // fix material autocomplete bug
    let fix = () => { $mdUtil.enableScrolling(); };
    $scope.$on('$destroy', fix);
    $window.onresize = fix;

    const httpGet = (query) => 
      $http({ 
        url    : query, 
        method : 'GET' 
      });

    this.querySearch = (query) => {
      // promise
      let deferred = $q.defer();
      httpGet(`/api/Medications?filter[where][name][regexp]=/${query}/i`)
        .success((json) => {
          deferred.resolve(json.map((medication) => {
            return {
              value  : medication.name.toLowerCase(),
              display: medication.name
            };
          })); 
      });
      return deferred.promise;
    };

    this.safe = (name) => name.replace(/[\/\.#\$\[\]]/g, '');

    this.updateFireBaseCounter = () => {
      let safe = this.safe(this.item.display);
      $http({ 
        url    : `/firebase/${safe}`, 
        method : 'POST' 
      })
      .success((json) => {
        console.log(json);
        self.count = json[Object.keys(json)[0]];
      })
      .error((data) => {
        self.count = '';
        console.log('firebase', data.error.status);
        if (data.error.status === 404) {
          self.noFireBase = true;
        }
      });
    }

    this.getMoreInformation = () => {
      let safe = this.safe(this.item.value);
      httpGet(`https://rxnav.nlm.nih.gov/REST/Prescribe/drugs?name=${safe}`)
        .success((json) => {
          if (json.drugGroup) {
            if (json.drugGroup.conceptGroup) {
              self.medication = json.drugGroup.conceptGroup[1].conceptProperties[0].name;
            } else if (json.drugGroup.name) {
              self.medication = self.item.display;
            }
          }
        })
        .error((data) => {
          self.medication = null;
          console.log('rxnav', data.error.status);
          if (data.error.status === 404) {
            self.noRxNav = true;
          }
        });
    }

    this.getImage = (item) => {
      let safe = this.safe(this.item.value);
      httpGet(`http://rximage.nlm.nih.gov/api/rximage/1/rxnav?name=${safe}&resolution=600`)
        .success((json) => {
          if (json.nlmRxImages && json.nlmRxImages.length) {
            self.picture = json.nlmRxImages[0].imageUrl;
          } else {
            self.picture = self.noPicture;
          }
        })
        .error(function(data) {
          self.picture = self.noPicture;
          console.log('rximage', data.error.status);
          if (data.error.status === 404) {
            self.noRxImage = true;
          }
        });
    }

    this.selectedItemChange = (item) => {
      if (item && item.value) {
        this.item = item;
        this.updateFireBaseCounter();
        this.getMoreInformation();
        this.getImage();
      }
    };

  }]);

  ngApp.config(['$routeProvider', '$locationProvider', ($routeProvider, $locationProvider) => {
      $routeProvider
        .when('/home', {
          template: `
            <md-content class="md-padding">
              <h1>Welcome</h1>
              <p>You can use above toolbar to:</p>
              <ul>
                <li>search for medication from database</li>
                <li>get request statistics from firebase</li>
              </ul>
            </md-content>
          `,
          controller: 'HomeCtrl',
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
                <a 
                  ng-if="!search.noRxImage" 
                  ng-href="{{search.picture!==search.noPicture?search.picture:'#'}}" 
                  ng-target="search.picture!==search.noPicture?'_blank':''" 
                  class="medication-picture">
                  <img width="100%" 
                    ng-src="{{search.picture}}" 
                    alt="picture"/>
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
        .when('/stats', {
          template: `
            <md-content class="md-padding">
              <p ng-repeat="(key,value) in stats">
                {{key}} - {{value}}
              </p>
            </md-content>
          `,
          controller: 'StatsCtrl',
          controllerAs: 'stats'
        })
        .otherwise({
          redirectTo: '/home'
        });

      $locationProvider.html5Mode(true);
  }]);

  ngApp.controller('HomeCtrl', ['$routeParams', function ($routeParams) {
    this.name   = 'HomeCtrl';
    this.params = $routeParams;
  }]);

  ngApp.directive('toolbar', () => ({
    template: `
        <md-toolbar>
          <div class="md-toolbar-tools">
            <div class="container">
              <h2 class="row">
                <a href="/home">
                  <i class="material-icons">home</i>
                  <span class="hidden-xs hidden-sm">Home</span>
                </a>
                <a href="/search">
                  <i class="material-icons">search</i>
                  <span class="hidden-xs hidden-sm">Search</span>
                </a>
                <a href="/stats">
                  <i class="material-icons">favorite</i>
                  <span class="hidden-xs hidden-sm">Stats</span>
                </a>
              </h2>
            </div>
          </div>
        </md-toolbar>
  `
  }));

  ngApp.directive('appbody', () => ({
    template: `
      <div id="body">
        <div class="container">
          <div ng-view></div>
        </div>
      </div>
    `
  }));

  ngApp.directive('app', () => ({
    template: `
      <toolbar></toolbar>
      <appbody></appbody>
    `
  }));

  angular.element(document).ready(() => {
    angular.bootstrap(document, ['ngApp']);
  });

})();