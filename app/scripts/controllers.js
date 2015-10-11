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

          $timeout(function(){
            $rootScope.person.createdAt = val.createdAt;
            $rootScope.person.displayName = val.displayName;
            $rootScope.person.email = val.email;
            $rootScope.person.uid = authData.uid;
          },500);
          
          // $scope.$apply(function(){
          //   $rootScope.person = val;
          // });
        });
        console.log('$rootScope.person: ', $rootScope.person);
        $ionicLoading.hide();
        $state.go('main.people');
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
  $scope.toIntro = function(){
    $state.go('intro');
  };
}])

.controller('ChatCtrl', ['$scope', 'Chats', '$state', function ($scope, Chats, $state) {
  $scope.IM = {
    textMessage: ''
  };

  var chats = Chats.all();
  chats.$loaded(function (data) {
    $scope.chats = data;
  });

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
          alert('Room created successfully!');
          $scope.modal.hide();
        }, 1000);
      } else {
        alert('Please enter room name & room icon & room intro');
      }
    };

    var rooms = Rooms.all();
    rooms.$loaded(function (data) {
      $scope.rooms = data;
    });

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
    var roomchats = RoomChats.all();
    roomchats.$loaded(function (data) {
      $scope.roomchats = data;
    });
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
  
  var contactsAll = People.all();
  contactsAll.$loaded(function (data) {
    $scope.contactsAll = data;
    $scope.currentID = $scope.person.uid;
    $scope.contacts = [];

    for (var i = $scope.contactsAll.length - 1; i >= 0; i--) {
      if($scope.contactsAll[i].$id != $scope.person.uid){
        $scope.contacts.push($scope.contactsAll[i]);
      }else if($scope.contactsAll[i].$id == $scope.person.uid){
        $scope.currentUser = $scope.contactsAll[i];
      }
    };
  });


  $scope.openChatPeopleList = function(currentUserID){
    $state.go('main.peoplechatlist', {
      currentUserID: currentUserID
    });
  };

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
  PeopleChat.selectPeople($state.params.peopleID, $scope.person.uid);
  var peopleName = PeopleChat.getSelectedPeopleName();
  if (peopleName) {
    $scope.peopleName = " - " + peopleName;
    var peoplechats = PeopleChat.all();
    peoplechats.$loaded(function (data) {
      $scope.peoplechats = data;
    });
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
