'use strict';

angular.module('matsitchat.controllers', [])

.controller('IntroCtrl', ['$scope', '$state', '$ionicSlideBoxDelegate',
  function ($scope, $state, $ionicSlideBoxDelegate) {
 
  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('login');
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
}])

.controller('LoginCtrl', ['$scope', '$ionicModal', '$state', '$firebaseAuth', '$ionicLoading', '$rootScope','$timeout',
  function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope, $timeout) {
  
  var ref = new Firebase($scope.firebaseUrl);
  var auth = $firebaseAuth(ref);

  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.back = function(){
    $state.go('intro');
  };

  $scope.createUser = function (user) {
    console.log('Create User Function called');
    if (user && user.email && user.password && user.displayname) {
      $ionicLoading.show({
        template: 'Signing Up...'
      });

      auth.$createUser({
        email: user.email,
        password: user.password
      }).then(function (userData) {
        alert('User created successfully!');
        ref.child('users').child(userData.uid).set({
          email: user.email,
          displayName: user.displayname,
          createdAt: Firebase.ServerValue.TIMESTAMP 
        });
        $ionicLoading.hide();
        $scope.modal.hide();
      }).catch(function (error) {
        alert('Error: ' + error);
        $ionicLoading.hide();
      });
    } else {
      alert('Sorry, but you have to fill all the input fields :)');
    }
  };

  $scope.signIn = function(user) {
    if(user && user.email && user.pwdForLogin) {
      $ionicLoading.show({
        template: 'Signing In...'
      });
      auth.$authWithPassword({
        email: user.email,
        password: user.pwdForLogin
      }).then(function (authData) {
        console.log('Logged in as: ' + authData.uid);
        ref.child('users').child(authData.uid).once('value', function (dataSnapshot){
          var val = dataSnapshot.val();
          $rootScope.person = val;
          // $scope.$apply(function(){
          //   $rootScope.person = val;
          // });
        });
        console.log('$rootScope.person: ', $rootScope.person);
        $ionicLoading.hide();
        $state.go('main.chat');
      }).catch(function (error) {
        alert('Authentication failed: ' + error.message);
        $ionicLoading.hide();
      });
    } else {
      alert('Please enter email and password both!');
    }
  };
}])

.controller('MainCtrl',['$scope', '$state', function($scope, $state) {
  console.log('MainCtrl');
  
  $scope.toIntro = function(){
    $state.go('intro');
  };
}])

.controller('ChatCtrl', ['$scope', 'Chats', '$state', function ($scope, Chats, $state) {
  $scope.IM = {
    textMessage: ''
  };
  $scope.chats = Chats.all();

  $scope.sendMessage = function(msg) {
    Chats.send($scope.person, msg);
    $scope.IM.textMessage = '';
  };

  $scope.remove = function(chat) {
    Chats.remove(chat);
  };

  // $scope.doRefreshChats = function (){
  //   $timeout(function(){
  //     $scope.$broadcast('scroll.refreshComplete');
  //   }, 1000);
  // };
}])

.controller('RoomsCtrl', ['$scope','$ionicModal','Rooms', '$state', '$ionicLoading', '$timeout', 
  function ($scope, $ionicModal, Rooms, $state, $ionicLoading, $timeout) {

    $ionicModal.fromTemplateUrl('templates/main.createrooms.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.createRoom = function (room) {
      if(room && room.name && room.icon && room.intro){
        $timeout(function (){
          $ionicLoading.show({
            template: 'Creating a new room...'
          });
          Rooms.createRoom($scope.person, room.name, room.intro, room.icon);
          $ionicLoading.hide();
          alert('User created successfully!');
          $scope.modal.hide();
        }, 1000);
      } else {
        alert('Please enter room name & room icon & room intro');
      }
    };

    $scope.rooms = Rooms.all();

    $scope.openChatRoom = function (roomID) {
        $state.go('main.roomchat', {
            roomID: roomID
        });
    };

    // $scope.doRefreshRooms = function (){
    //   $timeout(function(){
    //     $scope.$broadcast('scroll.refreshComplete');
    //   }, 1000);
    // };
}])

.controller('RoomsChatCtrl', ['$scope','RoomChats','$state', function ($scope, RoomChats, $state) {
  $scope.IM = {
    textMessage: ""
  };
  console.log($state.params);
  RoomChats.selectRoom($state.params.roomID);
  var roomName = RoomChats.getSelectedRoomName();
  if (roomName) {
    $scope.roomName = " - " + roomName;
    $scope.roomchats = RoomChats.all();
  };

  $scope.sendMessage = function (msg) {
    RoomChats.send($scope.person, msg);
    $scope.IM.textMessage = "";
  };

  $scope.remove = function (chat) {
    RoomChats.remove(chat);
  };
}])

.controller('PeopleCtrl', ['$scope', 'People', '$state', function ($scope, People, $state) {
  
  $scope.contacts = People.all();

  $scope.openChatPeople = function (peopleID) {
    $state.go('main.peoplechat', {
      peopleID: peopleID
    });
  };

  // $scope.doRefreshPeople = function (){
  //   $timeout(function(){
  //     $scope.$broadcast('scroll.refreshComplete');
  //   }, 1000);
  // };
}])

.controller('PeopleChatCtrl', ['$scope','PeopleChat','$state', function ($scope, PeopleChat, $state) {
  $scope.IM = {
    textMessage: ""
  };
  console.log($state.params);
  PeopleChat.selectPeople($state.params.peopleID);
  var peopleName = PeopleChat.getSelectedPeopleName();
  if (peopleName) {
    $scope.peopleName = " - " + peopleName;
    $scope.peoplechats = PeopleChat.all();
  };

  $scope.sendMessage = function (msg) {
    PeopleChat.send($scope.person, msg);
    $scope.IM.textMessage = "";
  };

  $scope.remove = function (chat) {
    PeopleChat.remove(chat);
  };
}])

.controller('LogoutCtrl', ['$scope','$state', function ($scope, $state) {
  $scope.username = $scope.person.displayName;
  $scope.timestamp = $scope.person.createdAt;
  $scope.email = $scope.person.email;
}]);
