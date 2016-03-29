var app = angular.module('App',['ngRoute','ngAnimate','rzModule']);


	app.config(function($routeProvider) {

		$routeProvider
		.when('/',{
			templateUrl:'js/upload.html',
			controller:'UploadCtrl'
		})
		.when('/edit',{
			templateUrl:'js/users.html',
			controller:'EditCtrl'
		})

		.otherwise({
			redirectTo:'/'
		})
	})

