'use strict';
// Ionic Starter App

// MyChat App - Ionic & Firebase Demo

var firebaseUrl = "https://matsit.firebaseio.com/";

function onDeviceReady() {
    angular.bootstrap(document, ["matsitchat"]);
}

//console.log("binding device ready");
// Registering onDeviceReady callback with deviceready event

document.addEventListener("deviceready", onDeviceReady, false);

// 'matsitchat.services' is found in services.js
// 'matsitchat.controllers' is found in controllers.js

// angular.module is a global place for creating, registering and retrieving Angular modules
angular.module('matsitchat', ['ionic','angularMoment', 'config', 'matsitchat.controllers', 'firebase', 'matsitchat.services'])

.run(function($ionicPlatform, $rootScope,$state, $location, Auth, $ionicLoading, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // To Resolve Bug
    ionic.Platform.fullScreen();

    $rootScope.$state = $state;
    $rootScope.firebaseUrl = firebaseUrl;
    $rootScope.person = {
      createdAt: 1424187838968,
      displayName: "You",
      email: "abc@abc.com",
      uid: "abc"
    };

    Auth.$onAuth(function (authData){
      if(authData){
        console.log("Logged in as:", authData.uid);
      } else{
        $ionicLoading.hide();
        $location.path('/');
      }
    });

    $rootScope.logout = function(){
      $ionicLoading.show({
        template: 'Logging Out...'
      });
      Auth.$unauth();
    };

    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error){
      if(error === "AUTH_REQUIRED"){
        $location.path("/login");
      };
    });
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('intro', {
    url: '/',
    templateUrl: 'templates/intro.html',
    controller: 'IntroCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
    resolve:{
      'currentAuth': ['Auth',
        function (Auth){
          return Auth.$waitForAuth();
      }]
    }
  })
  .state('main', {
    url: '/main',
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl',
    resolve: {
      'currentAuth': ["Auth",
        function(Auth){
          return Auth.$requireAuth();
      }]
    }
  })
  .state('main.rooms', {
    url: '/rooms',
    views: {
      'rooms-tab':{
        templateUrl: 'templates/main.rooms.html',
        controller: 'RoomsCtrl'
      }
    }
  })
  .state('main.roomchat', {
    url: '/rooms/:roomID',
    views: {
      'rooms-tab':{
        templateUrl: 'templates/main.rooms.chat.html',
        controller: 'RoomsChatCtrl'
      }
    }
  })
  .state('main.chat', {
    url: '/chat',
    views: {
      'chat-tab': {
        templateUrl: 'templates/main.chat.html',
        controller: 'ChatCtrl'
      }
    }
  })
  .state('main.people', {
    url: '/people',
    views: {
      'people-tab': {
        templateUrl: 'templates/main.people.html',
        controller: 'PeopleCtrl'
      }
    }
  })
  .state('main.peoplechat', {
    url: '/people/:peopleID',
    views: {
      'people-tab':{
        templateUrl: 'templates/main.people.chat.html',
        controller: 'PeopleChatCtrl'
      }
    }
  })
  .state('main.logout', {
    url: '/logout',
    views: {
      'logout-tab': {
        templateUrl: 'templates/main.logout.html',
        controller: 'LogoutCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/');

});
