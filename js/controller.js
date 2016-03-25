var app = angular.module('App')

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
        })
        .error(function(){
        });
    }
}]);

app.factory('getUserData',["$http",function($http) {
  var getUserData = {}
  getUserData.apiData = function() {
    return $http.get('/api/currentfiles')
    }
    return getUserData
    // console.log(getUserData)
  }])

app.factory('savedFiles',function() {
  var savedFiles = []
  var savedFilesInstance = {}
  savedFilesInstance.addFile = function(file) {
    savedFiles = file
  }
  savedFilesInstance.listFile = function() {
    return savedFiles
  }
  return savedFilesInstance
})

app.factory('saved_users',['$http',function($http){
  var saved_users = {}
  saved_users.all_users = function() {
    return $http.get('/api/users')
  }
    return saved_users
}])

app.factory('loggedInUsers',function() {
  var loggedInUsers = []
  var loggedInUsersInstance = {}
  loggedInUsersInstance.addUser = function(user) {
    loggedInUsers = user
  }
  loggedInUsersInstance.listUser = function() {
    return loggedInUsers
  }
  loggedInUsersInstance.removeUser = function() {
    loggedInUsers.length = 0
  }
  return loggedInUsersInstance
})

// app.factory('getCurrentUserData',["$http",function($http) {
//   var getCurrentUserData = {}
//   getCurrentUserData.apiData = function() {
//     return $http.get('../public/users/'+loggedInUsers.listUser().username)
//     }
//     return getCurrentUserData
//     // console.log(getUserData)
//   }])

app.controller('UploadCtrl',['$scope', '$http', '$timeout', '$window', 'fileUpload','getUserData','savedFiles','saved_users','loggedInUsers', function($scope,$http,$timeout,$window,fileUpload,getUserData,savedFiles,saved_users,loggedInUsers) {
  $(document).ready(function(){
    $(this).scrollTop(0);
});
    $scope.allTracks = []
    $scope.currentTrack = function() {
        console.log($scope.curTrack)
    }

    $scope.uploadFile = function(path){     
        $scope.addFile = savedFiles.addFile
        $scope.listFile = savedFiles.listFile
            var file = $scope.myFile;
                console.log('file is ' );
                console.dir(file);
            var uploadUrl = "/fileUpload";
                fileUpload.uploadFileToUrl(file, uploadUrl);
                savedFiles.addFile({name:file.name})
            $scope.allTracks.push({name:file.name})          
            $scope.onlyFileName = ''
            $scope.onlyFileName += $scope.myFile.name
            var saveData = {
                music:$scope.onlyFileName,
                date:moment().format("MMM Do YY"),
                path:'../public/users/'+loggedInUsers.listUser().username+'/'+$scope.onlyFileName,
                user:loggedInUsers.listUser().username
                }       
                console.log(loggedInUsers.listUser().username)
                console.log('file-name: ' + $scope.onlyFileName)
                console.log('factory-list-uploads: ' + $scope.listFile())
                console.log('saved-data-as-music(key)-object :' + saveData.music)
        $http.post('/api/currentfiles',saveData)
    }

    $scope.globalDbData;
  $scope.getData = function getData() {
    getUserData.apiData().then(function(res) {
      $scope.allUserDbData = res.data;
            savedFiles.addFile(res.data)
      console.log(savedFiles.listFile())
    })
  }

    $scope.getData()

    $scope.music;
    $scope.audioPath = '../public/users/'

    $scope.loadSound = function(item) {  
        $scope.soundObj = {}
        $scope.soundID = item
        getUserData.apiData().then(function(res) { 
            $scope.soundArr = res.data
            $scope.current_user_tracks = []

            for(var item in $scope.soundArr) {
              if($scope.soundArr[item].user === loggedInUsers.listUser().username)
                $scope.current_user_tracks.push($scope.soundArr[item])
                  // console.log($scope.current_user_tracks)
              }
                console.log($scope.soundArr)
        })
    }

    $scope.timed_load = function() {
      $timeout($scope.loadSound(),5000)
    }

    $scope.deleteTrack = function(item,path,name) {
        getUserData.apiData().then(function(res) { 
            $scope.soundArr = res.data
            for(var key in $scope.soundArr) {
              var soundID = $scope.soundArr[key][item]
              $scope.sendDataRemoveID = $scope.soundArr[key].name
              var removeData = {
                    id:item,
                    path:'../public/users/'+loggedInUsers.listUser().username+'/'+name,
                    name:name,
                    user:loggedInUsers.listUser().username}               
                console.log(removeData)
                $http.post('/api/removecurrenttrack',removeData).then(function() {
                        console.log('removing track '+removeData.path)
                })
            }
        })
    }

    $scope.updateSound = function(item) {
        $timeout($scope.loadSound,1000)
    }

  // $scope.playSound = function(id) {
  //       $scope.played = createjs.Sound.play(id) = createjs.Sound.stop(id)
  //       $scope.check =  $scope.played ? createjs.Sound.play(id):createjs.Sound.stop(id)
  //   }

  // $scope.pauseSound = function(id) {
  //   createjs.Sound.stop(id) 
  // }

  //   $scope.togglePlayback = function(sound){
  //       if(sound._paused){
  //           $scope.isPlaying = false;
  //           sound.pause();
  //       } else {
  //           $scope.isPlaying = true;
  //           sound.resume();
  //       }
    
  //   }

    $scope.trackList=[];        
    $scope.changedValue=function(item) {
        // console.log($scope.trackList)
        if(item !== undefined){
        $scope.trackList.push(item);
        }
    }    

    $scope.trackListTwo=[];        
    $scope.changedValueTwo=function(item) {
        // console.log($scope.trackList)
        if(item !== undefined){
        $scope.trackListTwo.push(item);
        }
    }

    /*.............................new users................................*/
 
    $scope.addUser = function(username,email,password) {
      saved_users.all_users().then(function(res) {
        console.log(res.data)
        console.log(username)
      var user_data_check = res.data
      $scope.new_user.username = username
      $scope.new_user.email = email
      $scope.new_user.password = password
      var userData = 
          {user:$scope.new_user.username,
          email:$scope.new_user.email,
          password:$scope.new_user.password
        }

        if(user_data_check.length === 0) {
          $http.post('/api/users',userData)
          $scope.new_user.username=""
          $scope.new_user.email=""
          $scope.new_user.password=""
          return;
              // userData.$setPristine()   
        } else if
        (user_data_check.email == $scope.new_user.email && user_data_check.username == $scope.new_user.username && user_data_check.password == $scope.new_user.password) {   
           console.log('username already taken') 
           return undefined;
        }else {
              $http.post('/api/users',userData)
              $scope.new_user.username=""
              $scope.new_user.email=""
              $scope.new_user.password=""
        }   
      
      })
    }

    $scope.currentUser = function(user,password) {
      // $scope.logged_in_user = false
      $scope.user.logged_in = user
      $scope.user.logged_in_password = password
      saved_users.all_users().then(function(res) {
        var all_user_data = res.data
        console.log(all_user_data)
        for(var cur in all_user_data) {
            if(all_user_data[cur].username === $scope.user.logged_in &&
             all_user_data[cur].password === $scope.user.logged_in_password) {
              // loggedInUsers.removeUser()
              loggedInUsers.addUser(all_user_data[cur])
              $scope.display_user_btn = loggedInUsers.listUser().username || ""
                console.log(loggedInUsers.listUser().username)
                $scope.user.logged_in = "";
                $scope.user.logged_in_password = "";

        }
      }
      })
    }
    $scope.send_newTrack = function() {

          var sendUser = 
          {user:loggedInUsers.listUser().username,
           name:$scope.download_track,
           path:'../public/users/'+loggedInUsers.listUser().username+'/'+$scope.download_track,
           created:moment().format("MMM Do YY")}
           console.log($scope.download_track)
           if(sendUser.name !== undefined) {
           $http.post('/api/recordinglocation',sendUser)
         } else {return}
                // $http.post('/api/currenttracks',sendUser)
      }

    $scope.current_user_logout = function() {
      loggedInUsers.addUser({})
      console.log(loggedInUsers.listUser())
    }

     
     $scope.listUsers = function() {
        $timeout(loggedInUsers.listUser(),5000)
    // console.log('factory-list-uploads: ' + $scope.listFile())
    }
   $scope.listUsers()


    /*.............................not working yet................................*/

    // $scope.deleteUser = function(current_user) {
    //   $scope.user.current_user_view = current_user
    //   saved_users.all_users().then(function(res) {
    //       var all_user_data = res.data
    //       console.log(res.data)
    //       for(var user in $scope.user.current_user_view) {
    //         if(all_user_data[user].username === $scope.user.current_user_view && all_user_data[user].id === all_user_data[user].id) {
    //           console.log(all_user_data[user].id)
    //           var user_result = {ID:all_user_data[user].id,name:all_user_data[user].username}
    //           $http.post('/api/removeuser',user_result)
    //         }
    //       }
    //         $http.post('/api/deleteuser',user_result)
    //   })
    // }

    /*.............................send file join info................................*/

    $scope.shared_tracks = []
    $scope.share_selected = false

    $scope.share_files = function(shared) {
      $scope.share_selected = false
      $scope.shared_tracks.push(shared)
      $scope.shared_tracks.sort()
      for(var i = 0; i < $scope.shared_tracks.length; i++) {
        if($scope.shared_tracks[i] === $scope.shared_tracks[i+1]) {
          console.log(shared)
          $scope.shared_tracks.splice(i,1)
          $scope.active = !$scope.active
    
    }
  }
      console.log($scope.shared_tracks)
      console.log($scope.shared_tracks.length)
    }

    $scope.reset_shares = function() {
        $scope.shared_tracks.length = 0
      
    }

    $scope.submit_shares = function(shared_target) {
          $scope.shared_user_target = shared_target
      var grouped_share = 
        {tracks:$scope.shared_tracks,
        send_user:loggedInUsers.listUser().username,
        receiving_user:$scope.shared_user_target,
        copied:moment().format("MMM Do YY")}
      console.log('grouped_share: '+grouped_share)
          $http.post('/api/sharedtracks',grouped_share)
          }
  

    $scope.mergeFiles = function(track_one,track_two,track_name) {
      console.log(track_one,track_two,track_name)
      var mergeTracks = {track_one:track_one,
                         track_two:track_two,
                         track_name:track_name,
                         created:moment().format("MMM Do YY"),
                         user:loggedInUsers.listUser().username,
                         path:'../public/users/'+loggedInUsers.listUser().username+'/'+track_name
                       }
      $http.post('/api/merge',mergeTracks).then(function(res) {
        console.log(res.data)
      })
    }

    /*.............................playback controls...........................*/

    $scope.audioPath = '../public/users/'+loggedInUsers.listUser().username+'/'
    $scope.audioPathTwo = '../public/users/'+loggedInUsers.listUser()+'/'

    $scope.song=function(){
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source;
    var songLength;
                    
    var play = document.querySelector('.play');
    var stop = document.querySelector('.stop');
    var playbackControl = document.querySelector('.playback-rate-control');
    var playbackValue = document.querySelector('.playback-rate-value');
    playbackControl.setAttribute('disabled', 'disabled');
    var loopstartControl = document.querySelector('.loopstart-control');
    var loopstartValue = document.querySelector('.loopstart-value');
    loopstartControl.setAttribute('disabled', 'disabled');
    var loopendControl = document.querySelector('.loopend-control');
    var loopendValue = document.querySelector('.loopend-value');
    loopendControl.setAttribute('disabled', 'disabled');
    
    $scope.getData = function() {
        for(var i = 0; i < $scope.trackList.length; i++) {
            $scope.lastTrackListIndex = $scope.trackList[i]
        }

        console.log($scope.lastTrackListIndex)
      source = audioCtx.createBufferSource();
      request = new XMLHttpRequest();
      request.open('GET','../public/users/'+loggedInUsers.listUser().username+'/'+$scope.lastTrackListIndex, true);
      console.log('../public/users/'+loggedInUsers.listUser().username+'/'+$scope.lastTrackListIndex)

      request.responseType = 'arraybuffer';
      request.onload = function() {
        var audioData = request.response;
        audioCtx.decodeAudioData(audioData, function(buffer) {
            myBuffer = buffer;
            songLength = buffer.duration;
            source.buffer = myBuffer;
            source.playbackRate.value = playbackControl.value;
            source.connect(audioCtx.destination);
            source.loop = true;
            loopstartControl.setAttribute('max', Math.floor(songLength));
            loopendControl.setAttribute('max', Math.floor(songLength));
          },
          function(e){"Error with decoding audio data" + e.err});
      }
      request.send();
    }

    play.onclick = function() {
      $scope.getData();
      console.log($scope.trackList)
      source.start(0);
      play.setAttribute('disabled', 'disabled');
      playbackControl.removeAttribute('disabled');
      loopstartControl.removeAttribute('disabled');
      loopendControl.removeAttribute('disabled');
    }
    stop.onclick = function() {
      source.stop(0);
      play.removeAttribute('disabled');
      playbackControl.setAttribute('disabled', 'disabled');
      loopstartControl.setAttribute('disabled', 'disabled');
      loopendControl.setAttribute('disabled', 'disabled');
    }
    playbackControl.oninput = function() {
      source.playbackRate.value = playbackControl.value;
      playbackValue.innerHTML = playbackControl.value;
    }
    loopstartControl.oninput = function() {
      source.loopStart = loopstartControl.value;
      loopstartValue.innerHTML = loopstartControl.value;
    }
    loopendControl.oninput = function() {
      source.loopEnd = loopendControl.value;
      loopendValue.innerHTML = loopendControl.value;
    }
    }

    $scope.songTwo=function(){
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var sourceTwo;
    var songLengthTwo;

    //second audio source
    var playTwo = document.querySelector('.playTwo');
    var stopTwo = document.querySelector('.stopTwo');
    var playbackControlTwo = document.querySelector('.playback-rate-control-two');
    var playbackValueTwo = document.querySelector('.playback-rate-value-two');
    playbackControlTwo.setAttribute('disabled', 'disabled');
    var loopstartControlTwo = document.querySelector('.loopstart-control-two');
    var loopstartValueTwo = document.querySelector('.loopstart-value-two');
    loopstartControlTwo.setAttribute('disabled', 'disabled');
    var loopendControlTwo = document.querySelector('.loopend-control-two');
    var loopendValueTwo = document.querySelector('.loopend-value-two');
    loopendControlTwo.setAttribute('disabled', 'disabled');

    $scope.getDataTwo = function() {
        for(var i = 0; i < $scope.trackListTwo.length; i++) {
            $scope.lastTrackListIndexTwo = $scope.trackListTwo[i]
        }
        console.log($scope.lastTrackListIndexTwo)
      sourceTwo = audioCtx.createBufferSource();
      requestTwo = new XMLHttpRequest();
      requestTwo.open('GET','../public/users/'+loggedInUsers.listUser().username+'/'+$scope.lastTrackListIndexTwo, true);
      requestTwo.responseType = 'arraybuffer';
      requestTwo.onload = function() {
        var audioDataTwo = requestTwo.response;
        audioCtx.decodeAudioData(audioDataTwo, function(buffer) {
            myBuffer = buffer;
            songLength = buffer.duration;
            sourceTwo.buffer = myBuffer;
            sourceTwo.playbackRate.value = playbackControlTwo.value;
            sourceTwo.connect(audioCtx.destination);
            sourceTwo.loop = true;
            loopstartControlTwo.setAttribute('max', Math.floor(songLengthTwo));
            loopendControlTwo.setAttribute('max', Math.floor(songLengthTwo));
          },
          function(e){"Error with decoding audio data" + e.err});
      }
      requestTwo.send();
    }

    playTwo.onclick = function() {
      $scope.getDataTwo();
      console.log($scope.trackListTwo)
      sourceTwo.start(0);
      playTwo.setAttribute('disabled', 'disabled');
      playbackControlTwo.removeAttribute('disabled');
      loopstartControlTwo.removeAttribute('disabled');
      loopendControlTwo.removeAttribute('disabled');
    }
    stopTwo.onclick = function() {
      sourceTwo.stop(0);
      playTwo.removeAttribute('disabled');
      playbackControlTwo.setAttribute('disabled', 'disabled');
      loopstartControlTwo.setAttribute('disabled', 'disabled');
      loopendControlTwo.setAttribute('disabled', 'disabled');
    }
    playbackControlTwo.oninput = function() {
      sourceTwo.playbackRate.value = playbackControlTwo.value;
      playbackValueTwo.innerHTML = playbackControlTwo.value;
    }
    loopstartControlTwo.oninput = function() {
      sourceTwo.loopStart = loopstartControlTwo.value;
      loopstartValueTwo.innerHTML = loopstartControlTwo.value;
    }
    loopendControlTwo.oninput = function() {
      sourceTwo.loopEnd = loopendControlTwo.value;
      loopendValueTwo.innerHTML = loopendControlTwo.value;
    }
    }
            
}])

app.controller('MainCtrl',function($scope,$http) {
    
})