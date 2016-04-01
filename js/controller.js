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
                $scope.login_check = loggedInUsers.listUser().username
                if($scope.login_check !== undefined) {
        $http.post('/api/currentfiles',saveData)
      } else {
        console.log('no user logged in')
        return
      }
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

    $scope.trackList=[];        
    $scope.changedValue=function(item) {
        if(item !== undefined){
        $scope.trackList.push(item);
        }
    }    

    $scope.trackListTwo=[];        
    $scope.changedValueTwo=function(item) {
        if(item !== undefined){
        $scope.trackListTwo.push(item);
        }
    }

    // $scope.watch($scope.trackListTwo)
    $scope.trackDownload = function() {
      console.log($scope.downloading)
      if($scope.trackListTwo.length++) {
        console.log($scope.downloading)
      }
      if($scope.downloading) {
        $scope.downloading
        return
      }
    }
    $scope.initTrackDownload = function() {
    $timeout($scope.trackDownload,4000)
  }
$scope.initTrackDownload()
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
          $http.post('/api/users',userData).then(function() {
            loggedInUsers.addUser({
              username:$scope.new_user.username,
              email:$scope.new_user.email,
              password:$scope.new_user.passwords})
            console.log(loggedInUsers.listUser())
          })
          // $scope.new_user.username=""
          // $scope.new_user.email=""
          // $scope.new_user.password=""
            return;
        } else if
        (user_data_check.email == $scope.new_user.email && user_data_check.username == $scope.new_user.username && user_data_check.password == $scope.new_user.password) {   
           console.log('username already taken') 
            return;
        }else {
              $http.post('/api/users',userData).then(function() {
                loggedInUsers.addUser(
                  {username:$scope.new_user.username,
                  email:$scope.new_user.email,
                  password:$scope.new_user.password})
                console.log(loggedInUsers.listUser())
                
              })
              // $scope.new_user.username=""
              // $scope.new_user.email=""
              // $scope.new_user.password=""
        }   
      
      })
    }
    
    $scope.currentUser = function(user,password) {
      $scope.display_user = loggedInUsers.listUser().name
      $scope.user.logged_in = user
      $scope.user.logged_in_password = password
      saved_users.all_users().then(function(res) {
        var all_user_data = res.data
        console.log(all_user_data)
        for(var cur in all_user_data) {
            if(all_user_data[cur].username === $scope.user.logged_in &&
             all_user_data[cur].password === $scope.user.logged_in_password) {
              loggedInUsers.addUser(all_user_data[cur])
              $scope.display_user_btn = loggedInUsers.listUser().username || ""
                console.log(loggedInUsers.listUser().username)
                $scope.user.logged_in = "";
                $scope.user.logged_in_password = "";
                $scope.display_user = loggedInUsers.listUser().name
                console.log($scope.display_user)
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
      console.log(grouped_share)
      if(grouped_share.receiving_user !== undefined &&
         grouped_share.tracks !== undefined &&
         grouped_share.send_user !== undefined) {
          $http.post('/api/sharedtracks',grouped_share)
      } else {
        console.log('empty')
        return;
        }
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


// 1,100,115,40 

      $scope.sliderA = {
  value: 116,
  options: {
    floor: 0,
    ceil: 200
  }
};

$scope.sliderB = {
  value: 114,
  options: {
    floor: 0,
    ceil: 200
  }
};

$scope.sliderC = {
  value: 2,
  options: {
    floor: 1,
    ceil: 10
  }
};

$scope.sliderD = {
  value: 1,
  options: {
    floor: 0,
    ceil: 7
  }
};

$scope.sliderE = {
  value: 75,
  options: {
    floor: 0,
    ceil: 100
  }
};

      $scope.sliderF = {
  value: 116,
  options: {
    floor: 0,
    ceil: 200
  }
};

$scope.sliderG = {
  value: 114,
  options: {
    floor: 0,
    ceil: 200
  }
};

$scope.sliderH = {
  value: 2,
  options: {
    floor: 1,
    ceil: 10
  }
};

$scope.sliderI = {
  value: 1,
  options: {
    floor: 0,
    ceil: 7
  }
};

$scope.sliderJ = {
  value: 75,
  options: {
    floor: 0,
    ceil: 100
  }
};

$scope.sliderOsc = {
  value: 50,
  options: {
    floor: 0,
    ceil: 3000
  }
};

      $scope.audioPath = '../public/users/'+loggedInUsers.listUser().username+'/'
      $scope.audioPathTwo = '../public/users/'+loggedInUsers.listUser()+'/'
  
      $scope.song=function(){
      var audioCtx = new ($window.AudioContext || $window.webkitAudioContext)();
      var source;
      var songLength;
      var oscillator;
                      
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
      var _ctx = document.querySelector('#sourcedisplay');
      var ctx = _ctx.getContext('2d');
    
    $scope.getData = function() {
        for(var i = 0; i < $scope.trackList.length; i++) {
            $scope.lastTrackListIndex = $scope.trackList[i]
        }

        console.log($scope.lastTrackListIndex)
      source = audioCtx.createBufferSource();
      oscillator = audioCtx.createOscillator();
      analyser = audioCtx.createAnalyser();
      var freq = new Uint8Array(analyser.frequencyBinCount)
      analyser.fftSize = 256;
      request = new XMLHttpRequest();
      request.open('GET','../public/users/'+loggedInUsers.listUser().username+'/'+$scope.lastTrackListIndex, true);
      console.log('../public/users/'+loggedInUsers.listUser().username+'/'+$scope.lastTrackListIndex)

      request.responseType = 'arraybuffer';
      request.onload = function() {
        if($scope.downloading) {
          stop()
        }
        var audioData = request.response;
        var fFrequencyData = new Float32Array(analyser.frequencyBinCount);
        var bFrequencyData = new Uint8Array(analyser.frequencyBinCount);
        audioCtx.decodeAudioData(audioData, function(buffer) {
            myBuffer = buffer;
            songLength = buffer.duration;
            source.buffer = myBuffer;
            source.playbackRate.value = playbackControl.value;
            source.loop = true;
            loopstartControl.setAttribute('max', Math.floor(songLength));
            loopendControl.setAttribute('max', Math.floor(songLength));
            source.connect(analyser)
            analyser.getFloatFrequencyData(fFrequencyData);
            analyser.getByteFrequencyData(bFrequencyData);
            analyser.getByteTimeDomainData(bFrequencyData);
            analyser.connect(audioCtx.destination)
          

            console.log(fFrequencyData)
            console.log(bFrequencyData)


            // oscillator.connect(audioCtx.destination);
            console.log(oscillator)
            console.log(bFrequencyData)
            console.log(fFrequencyData)
          //   $scope.set_oscillator = function() {
          //     oscillator.type = 'sawtooth';
          //     oscillator.frequency.value = $scope.sliderOsc.value; // value in hertz
          //     console.log(oscillator.frequency.value)
              
          //     oscillator.detune.value = Math.pow(2, 1/12) * 10;
          //     oscillator.start(0);
          // }

            draw = function () {
    var width, height, barWidth, barHeight, barSpacing, frequencyData, barCount, loopStep, i, hue;
 
    width = _ctx.width;
    height = _ctx.height;
    barWidth = $scope.sliderD.value;
    barSpacing = $scope.sliderC.value;
    ctx.clearRect(0, 0, width, height);
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);
    barCount = Math.round(width / (barWidth + barSpacing));
    loopStep = Math.floor(frequencyData.length / barCount);
 
    for (i = 0; i < barCount; i++) {
        barHeight = frequencyData[i * loopStep];
        hue = parseInt($scope.sliderA.value * ($scope.sliderB.value - (barHeight / 255)), 10);
        ctx.fillStyle = 'hsl(' + hue + ','+$scope.sliderE.value+'%,50%)';
        ctx.fillRect(((barWidth + barSpacing) * i) + (barSpacing / 2), height, barWidth - barSpacing, -barHeight);
    }
     
};
$scope.startFreq = function () {
    $scope.timer = setInterval($scope.timerFunction, 10);
};

$scope.timerFunction = function () {
    draw();
  }
  $scope.startFreq()
          
          },
          function(e){"Error with decoding audio data" + e.err});
      }
      request.send();
    }

    play.onclick = function() {
      $scope.getData();
      console.log($scope.trackList)
      source.start(0);
      oscillator.start(0);
      console.log(source)
      console.log(analyser)
      console.log()
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
    var audioCtx = new ($window.AudioContext || $window.webkitAudioContext)();
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
    var _ctx = document.querySelector('#sourcedisplayTwo')
    var ctx = _ctx.getContext('2d');

    $scope.getDataTwo = function() {
        for(var i = 0; i < $scope.trackListTwo.length; i++) {
            $scope.lastTrackListIndexTwo = $scope.trackListTwo[i]
        }
        console.log($scope.lastTrackListIndexTwo)
      sourceTwo = audioCtx.createBufferSource();
      analyserTwo = audioCtx.createAnalyser();
      analyserTwo.fftSize = 256;
      requestTwo = new XMLHttpRequest();
      requestTwo.open('GET','../public/users/'+loggedInUsers.listUser().username+'/'+$scope.lastTrackListIndexTwo, true);
      requestTwo.responseType = 'arraybuffer';
      requestTwo.onload = function() {
        var frequencyDataTwo = new Uint8Array(analyserTwo.frequencyBinCount);
        var audioDataTwo = requestTwo.response;
        audioCtx.decodeAudioData(audioDataTwo, function(buffer) {
            myBuffer = buffer;
            songLength = buffer.duration;
            sourceTwo.buffer = myBuffer;
            sourceTwo.playbackRate.value = playbackControlTwo.value;
            sourceTwo.loop = true;
            sourceTwo.connect(analyserTwo)
            analyserTwo.getByteFrequencyData(frequencyDataTwo);
            analyserTwo.connect(audioCtx.destination);
            loopstartControlTwo.setAttribute('max', Math.floor(songLengthTwo));
            loopendControlTwo.setAttribute('max', Math.floor(songLengthTwo));
            

              drawTwo = function () {
    var width, height, barWidth, barHeight, barSpacing, frequencyDataTwo, barCount, loopStep, i, hue;
 
    width = _ctx.width;
    height = _ctx.height;
    barWidth = $scope.sliderI.value;
    barSpacing = $scope.sliderH.value;
 
    ctx.clearRect(0, 0, width, height);
    frequencyDataTwo = new Uint8Array(analyserTwo.frequencyBinCount);
    analyserTwo.getByteFrequencyData(frequencyDataTwo);
    barCount = Math.round(width / (barWidth + barSpacing));
    loopStep = Math.floor(frequencyDataTwo.length / barCount);
 
    for (i = 0; i < barCount; i++) {
        barHeight = frequencyDataTwo[i * loopStep];
        hue = parseInt($scope.sliderF.value * ($scope.sliderG.value - (barHeight / 255)), 10);
        ctx.fillStyle = 'hsl(' + hue + ','+$scope.sliderJ.value+'%,50%)';
        ctx.fillRect(((barWidth + barSpacing) * i) + (barSpacing / 2), height, barWidth - barSpacing, -barHeight);
    }
     
};

$scope.startFreqTwo = function () {
    $scope.timerTwo = setInterval($scope.timerFunctionTwo, 10);
};

$scope.timerFunctionTwo = function () {
    drawTwo();
  }
  $scope.startFreqTwo()
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


app.controller('AudioController',function($scope,$http) {
    
})