var express = require('express'),
	bodyParser = require('body-parser'),
	pg = require('pg'),
	path = require('path'),
	knex = require('./db/knex'),
	path = require('path'),
	requestP = require('request-promise'),
	fs = require('fs'),
	glob = require('glob'),
	upload = require('jquery-file-upload-middleware'),
	mkdirp = require('mkdirp'),
	rmdir = require('rmdir'),
	Promise = require('bluebird'),
	child_process= require('child_process'),
	exec = child_process.exec,
	options = {
 		 timeout: 10000,
 		 killSignal: 'signal lost'
	},

	app = express();

/*.............................configure upload middleware................................*/

    upload.configure({
        uploadDir: __dirname + '/public/uploads',
        uploadUrl: '/uploads',
        imageVersions: {
            thumbnail: {
                width: 80,
                height: 80
            }
        }
    });

	app.use('/fileUpload', upload.fileHandler());
	app.use(bodyParser.urlencoded({extended:true}))
	app.use(bodyParser({limit: '5mb'}));
	app.use(bodyParser.json())
	app.use('/js',express.static(path.join(__dirname, './js')))
	app.use('/public',express.static(path.join(__dirname, './public')))

/*...........................post all selected files to api................................*/

	app.post('/api/currentfiles',function(req,res) {
		var audio = req.body.music,
			date = req.body.date,
			path = req.body.path,
			user = req.body.user
		console.log(audio)
			knex('audio')
			.insert({
				name:audio,
				created:date,
				file_path:path,
				user:user
				})
			.returning('id').then(function() {
			setTimeout(function() {
				console.log(user)
				child_process 
				.exec("cd public/uploads && mv "+"'"+audio+"'"+" ../users/"+user,function(err,stdout,stderr) {
			if(err) {
			console.log('failed ' + err.code)
			console.log(stdout)
			return
				}
			console.log(stdout)
				}) 
  			},3000)
		})
			res.end('It worked!')
	})
			




/*........................delete selected file from db && local fs...........................*/

	app.post('/api/removecurrenttrack',function(req,res) {
		var removeItemID = req.body.id,
			filePath = req.body.path,
			user = req.body.user,
			pathToDeletedFile = req.body.name;
				console.log('removeItemID: ' + removeItemID)
				console.log('url-path: ' + filePath)
				knex('audio').where({file_path:filePath}).del()
					.then(function(data) {
						var delPath = './public/users/'+user+'/'+pathToDeletedFile
					glob(delPath,function(err,files){
			    		if (err) throw err;
			    	files.forEach(function(item,index,array){
			        	console.log(item + " found");
			    	});
			    	files.forEach(function(item,index,array){
			        	fs.unlink(item, function(err){
			            	if (err) throw err;
			             console.log(item + " deleted");
			        });
			    });
			});
		});
					res.send()
	})

	app.post('/api/users',function(req,res) {
		var user = req.body.user,
			email = req.body.email,
			password = req.body.password;
		knex('users').insert({
				username:user,
				email:email,
				password:password})
		.then(function(data) {
			console.log('user: '+user+', email: '+email+' password: '+password)
			mkdirp('./public/users/'+user,function(error) {
				if(error) {
					console.log(error)
			} else {
				console.log('directory '+user+' created')
			}
		})
	})
		res.send()
})


app.post('/api/merge',function(req,res) {
	var track_one = req.body.track_one,
		track_two = req.body.track_two,
		track_name = req.body.track_name,
		user = req.body.user,
		created = req.body.created,
		path = req.body.path;
		knex('audio').insert({name:track_name+'.mp3',created:created,file_path:path+'.mp3',user:user}).then(function() {
			console.log(user)
			child_process 
			.exec("cd public/users/"+user+" && ffmpeg -i "+"'"+track_one+
				"'"+" -i "+"'"+track_two+
				"'"+"  -filter_complex amerge -c:a libmp3lame -q:a 4 "+track_name+
				".mp3", function(err,stdout,stderr) {
				if(err) {
				console.log('failed ' + err.code)
				console.log(stdout)
				return
					}
				console.log(stdout)
				}) 
			})
		res.send()
		})

app.post('/api/recordinglocation',function(req,res) {
	var user = req.body.user,
		name = req.body.name,
		created = req.body.created,
		path = req.body.path;
		console.log('name: '+name+' user: '+user+' path: '+path)
			knex('audio').insert({user:user,name:name+'.wav',
				created:created,file_path:path+".wav"})
			.then(function(){
				setTimeout(function() {
				console.log(name)
			child_process 
			.exec("cd ../../downloads && mv *distinctpersonalaudiofile* ../AudioRecorder/newAudio/public/users/"+user+" && cd ../AudioRecorder/newAudio/public/users/"+user+" && mv *distinctpersonalaudiofile* "+name+".wav", function(err,stdout,stderr) {
				if(err) {
					console.log(stdout)
				console.log('failed ' + err.code)	
				return
			   		} 
				})
			},3000)
		})
			res.send()
	})

// var grouped_share = 
//         {tracks:$scope.shared_tracks,
//         send_user:loggedInUsers.listUser().username,
//         receiving_user:$scope.shared_user_target}
//           $http.post('/api/sharedtracks',grouped_share)

app.post('/api/sharedtracks',function(req,res) {
	var tracks = req.body.tracks,
		send_user = req.body.send_user,
		receiving_user = req.body.receiving_user,
		copied = req.body.copied;
		tracks.forEach(function(track) {
			knex('audio').where({user:send_user,name:track})
			.insert({name:track,
			created:'(from:'+send_user+')'+copied,
			user:receiving_user,
			file_path:"../public/users/"+receiving_user+"/"+track})
			.then(function() {
				console.log('got it')
				child_process 
			.exec("cd ./public/users/"+send_user+" && cp "+"'"+track+"'"+" ../"+receiving_user, function(err,stdout,stderr) {
				if(err) {
					console.log(stdout)
				console.log('failed ' + err.code)	
				return
			   		} 
				})
			})
		})
	
	
	// 	knex('audio').where({user:send_user,name:tracks})
	// 		.insert({name:receiving_user,
	// 		created:copied,user:receiving_user,
	// 		file_path:copied_tracks_filepath})
	// 	.then(function() {
			console.log('tracks: '+tracks+', send_user: '+send_user+', receiving_user: '+receiving_user+', copied: '+copied)
		// 	child_process 
		// 	.exec(, function(err,stdout,stderr) {
		// 		if(err) {
		// 			console.log(stdout)
		// 		console.log('failed ' + err.code)	
		// 		return
		// 	   		} 
		// 		})
		// })

		res.send()
	})
// })





 	// app.post('/api/removeuser',function(req,res){
 	// 	var id_path = req.body.ID
 	// 	var name = req.body.name
 	// 	knex('audio').where({user:name}).del()
 	// 	.then(function() {
 	// 		console.log(name)
 	// 		var delPath = "cd public/uploads/users/ && rm -r"+name
 	// 		child_process 
		// 	.exec(delPath, function(err,stdout,stderr) {
		// 		if(err) {
		// 			console.log(stdout)
		// 		console.log('failed ' + err.code)	
		// 		return
		// 	   		} 
		// 		})
 	// 		})	
		// })
		
 	
 



/*................................send all client data.......................................*/

	app.get('/api/currentfiles',function(req,res) {
		knex('audio').select('*').then(function(data) {
			res.send(data)
		})
	})

	app.get('/api/merge',function(req,res) {
		knex('audio').select('*').then(function(data) {
			res.send(data)
		})
	})

	app.get('/api/users',function(req,res) {
		knex('users').select('*').then(function(data) {
			res.send(data)
		})
	})

	app.use(function(req, res) {
  		res.sendFile(__dirname + '/index.html');
	});

	app.listen('3000',function() {
		console.log('word')
})

