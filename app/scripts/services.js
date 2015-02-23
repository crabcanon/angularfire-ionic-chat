'use strict';

angular.module('matsitchat.services', ['firebase'])
	.factory('Auth', ['$firebaseAuth', '$rootScope', function ($firebaseAuth, $rootScope) {
		var ref = new Firebase(firebaseUrl);
		return $firebaseAuth(ref);
}])

.factory('RoomChats', ['$firebase', 'Rooms', function ($firebase, Rooms) {
	
	var selectedRoomID;

	var ref = new Firebase(firebaseUrl);
	var roomchats;

	return {
		all: function() {
			return roomchats;
		},
		remove: function(roomchat) {
			roomchats.$remove(roomchat).then(function (ref) {
				ref.key() === roomchat.$id;
			});
		},
		get: function(roomchatID) {
			for (var i = 0; i < roomchats.length; i++) {
				if(roomchats[i].id === parseInt(roomchatID)) {
					return roomchats[i];
				}
			}
			return null;
		},
		getSelectedRoomName: function(){
			var selectedRoom;
			if (selectedRoomID && selectedRoomID !== null) {
				selectedRoom = Rooms.get(selectedRoomID);
				if (selectedRoom){
					return selectedRoom.name;
				} else {
					return null;
				}
			} else {
				return null;
			}
		},
		selectRoom: function(roomID) {
			console.log('Selecting the room with ID: ' + roomID);
			selectedRoomID = roomID;
			if(roomID){
				roomchats = $firebase(ref.child('rooms').child(selectedRoomID).child('roomchats')).$asArray();
			}
		},
		send: function(from, message) {
			console.log('Sending message from: ' + from.displayName + ' and the message is: ' + message);
			if (from && message) {
				var roomchatMessage = {
					from: from.displayName,
					message: message,
					createdAt: Firebase.ServerValue.TIMESTAMP
				};
				roomchats.$add(roomchatMessage).then(function (data) {
					console.log('Message added: ' + data);
				});
			}
		}
	};
}])

.factory('Rooms', ['$firebase', function ($firebase) {
	var ref = new Firebase(firebaseUrl);
	var rooms = $firebase(ref.child('rooms')).$asArray();

	return {
		all: function() {
			return rooms;
		},
		get: function(roomID) {
			if(roomID) {
				return rooms.$getRecord(roomID);
			} else {
				return null;
			}
		},
		createRoom: function (from, roomName, intro, icon) {
			if (from && roomName && intro) {
				var newRoom = {
					createdBy: from.displayName,
					name: roomName,
					icon: icon,
					intro: intro,
					createdAt: Firebase.ServerValue.TIMESTAMP
				};
				rooms.$add(newRoom).then(function (data) {
					console.log('Room added: ' + data);
				});
			}
		}
	};
}])

.factory('Chats', ['$firebase', function ($firebase) {

	var ref = new Firebase(firebaseUrl);
	var chats = $firebase(ref.child('chats')).$asArray();

	return {
		all: function (){
			return chats;
		},
		remove: function(chat) {
			chats.$remove(chat).then(function (ref) {
				ref.key() === chat.$id;
			});
		},
		send: function(from, message) {
			console.log('Sending message from: ' + from.displayName + ' and the message is: ' + message);
			if (from && message) {
				var chatMessage = {
					from: from.displayName,
					message: message,
					createdAt: Firebase.ServerValue.TIMESTAMP
				};
				chats.$add(chatMessage).then(function (data) {
					console.log('Message added: ' + data);
				});
			}
		}
	};
}])

.factory('People', ['$firebase', function ($firebase) {
	
	var ref = new Firebase(firebaseUrl);
	var people = $firebase(ref.child('users')).$asArray();

	return {
		all: function(){
			return people;
		},
		get: function(peopleID) {
			if(peopleID) {
				return people.$getRecord(peopleID);
			} else {
				return null;
			}
		}
	};
}])

.factory('PeopleChat', ['$firebase', 'People', function ($firebase, People) {
	
	var selectedPeopleID;
	var invitedPeopleID;
	var ref = new Firebase(firebaseUrl);
	var peoplechats;
	var peoplechatsReverse;

	return {
		all: function() {
			return peoplechats;
		},
		remove: function(peoplechat) {
			peoplechats.$remove(peoplechat).then(function (ref) {
				ref.key() === peoplechat.$id;
			});
		},
		get: function(peoplechatID) {
			for (var i = 0; i < peoplechats.length; i++) {
				if(peoplechats[i].id === parseInt(peoplechatID)) {
					return peoplechats[i];
				}
			}
			return null;
		},
		getSelectedPeopleName: function(){
			var selectedPeople;
			if (selectedPeopleID && selectedPeopleID !== null) {
				selectedPeople = People.get(selectedPeopleID);
				if (selectedPeople){
					return selectedPeople.displayName;
				} else {
					return null;
				}
			} else {
				return null;
			}
		},
		selectPeople: function(peopleID, currentID) {
			console.log('Selecting the person with ID: ' + peopleID);
			selectedPeopleID = peopleID;
			invitedPeopleID = currentID;
			if(peopleID && currentID){
				peoplechats = $firebase(ref.child('users').child(selectedPeopleID).child('peoplechats').child(invitedPeopleID)).$asArray();
				peoplechatsReverse = $firebase(ref.child('users').child(invitedPeopleID).child('peoplechats').child(selectedPeopleID)).$asArray();
			}
		},
		send: function(from, message) {
			console.log('Sending message from: ' + from.displayName + ' and the message is: ' + message);
			if (from && message) {
				var peoplechatMessage = {
					from: from.displayName,
					message: message,
					createdAt: Firebase.ServerValue.TIMESTAMP
				};
				// var peoplechatMessageReverse = {
				// 	from: fromReverse,
				// 	message: message,
				// 	createdAt: Firebase.ServerValue.TIMESTAMP  
				// };
				peoplechats.$add(peoplechatMessage).then(function (data) {
					console.log('Message added: ' + data);
				});
				peoplechatsReverse.$add(peoplechatMessage).then(function (data) {
					console.log('Message added: ' + data);
				});
			}
		}
	};
}]);
