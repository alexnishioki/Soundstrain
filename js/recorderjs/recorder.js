/*License (MIT)

Copyright Â© 2013 Matt Diamond

Permission is hereby granted, free of charge, to any person obtaining a copy of $scope software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and $scope permission notice shall be included in all copies or substantial portions of 
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.
*/
var app = angular.module('UploadCtrl',['$scope','$http','$window','$timeout','savd_files','savedUsers','loggedInUsers','getUserData',function($scope,$http,$window,$timeout,savdFiles,savedUsers,logggedin_users,getUserData) {
$scope.downloading = false
$scope.transferDownload = function(){

  var WORKER_PATH = 'js/recorderWorker.js';

  var Recorder = function(source, cfg){
    var config = cfg || {};
    var bufferLen = config.bufferLen || 4096;
    $scope.context = source.context;
    if(!$scope.context.createScriptProcessor){
       $scope.node = $scope.context.createJavaScriptNode(bufferLen, 2, 2);
    } else {
       $scope.node = $scope.context.createScriptProcessor(bufferLen, 2, 2);
    }
   
    var worker = new Worker(config.workerPath || WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: $scope.context.sampleRate
      }
    });
    var recording = false,
      currCallback;

    $scope.node.onaudioprocess = function(e){
      if (!recording) return;
      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
        ]
      });
    }

    $scope.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    }

    $scope.record = function(){
      recording = true;
    }

    $scope.stop = function(){
      recording = false;
    }

    $scope.clear = function(){
      worker.postMessage({ command: 'clear' });
    }

    $scope.getBuffers = function(cb) {
      currCallback = cb || config.callback;
      worker.postMessage({ command: 'getBuffers' })
    }

    $scope.exportWAV = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportWAV',
        type: type
      });
    }

    $scope.exportMonoWAV = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportMonoWAV',
        type: type
      });
    }

    worker.onmessage = function(e){
      var blob = e.data;
      console.log(blob)
      currCallback(blob);
    }

    source.connect($scope.node);
    $scope.node.connect($scope.context.destination);   // if the script node is not connected to an output the "onaudioprocess" event is not triggered in chrome.
  };

  $scope.Recorder.setupDownload = function(blob, filename){
    $scope.downloading = true
    if($scope.downloading = true){
      stop()
    }
    filename = 'distinctpersonalaudiofile.wav'
    var url = ($window.URL || $window.webkitURL).createObjectURL(blob);
    console.log($window.URL)
    $scope.link = "#/"
    $scope.link.href = url;
    $scope.link.download = filename || 'output.wav';
  }

  $window.Recorder = Recorder;

}
$scope.transferDownload($window);
}])
