var tmi = require('tmi.js');
var options = require('./config.js')
var fs = require('fs');
var request = require("request");
var bot = new tmi.client(options);
var Bottleneck = require("bottleneck");
var limiter = new Bottleneck(0, 5000, 0);
var CronJob = require('cron').CronJob;
var channel = JSON.stringify(options.channels).slice(2, -2);
var mkdirp = require('mkdirp');

bot.connect();

bot.on('connected', function (channel, user, message, self) {
	console.log("[DEBUG] Bot connected to channel")
	bot.action(JSON.stringify(options.channels).slice(2, -2), "Yucibot connected MrDestructoid")
});

//Basic commands
//I have to move this to a /commands map and import them from there
bot.on('message', function (channel, user, message, self) {
	 if (message.startsWith("!test")) {
    	bot.say(channel, "This is a command xD")
	   	console.log('Did the thing')
	}
	else if (message.startsWith("!twitter")) {
		bot.say(channel, "Merijn his Twitter is https://www.twitter.com/Mstiekema_")
	}
	else if (message.startsWith("!slap")) {
		bot.say(channel, user.username + " slapped" + message.substring(message.indexOf(" ")) + " in the face")
	}
	else if (message.startsWith("1quit")) {
		if (user.mod === true || user.username == channel.substring(1)) {
			bot.say(channel, "Shutting down Yucibot MrDestructoid")
			bot.disconnect()}
		else {
			bot.say(channel, "You are not allowed to turn off the bot OMGScoots")
		};
	}
	else if (message.includes("Alliance") || message.includes("alliance")) {
		bot.say(channel, "LOK'TAR OGAR, FOR THE HORDE SMOrc")
	};
});

// Overwatch commands
bot.on('message', function(channel, user, message, self) {
	if(message.startsWith("!owrank")) {
		if(message.length < 8) {
			request('https://api.lootbox.eu/pc/eu/' + options.identity.owUser + '/profile', function (error, response, body) {
			var rank = JSON.parse(body);
			bot.say(channel, channel.substring(1) + " is op het moment rank " + rank.data.competitive.rank + " in Overwatch! PogChamp")});
		}
		else {
			var userOW = message.split(' ');
			request('https://api.lootbox.eu/pc/eu/' + userOW[1] + '/profile', function (error, response, body) {
				var rank = JSON.parse(body);
				bot.say(channel, userOW[1] + " is op het moment rank " + rank.data.competitive.rank + " in Overwatch! PogChamp")});
		}
	};
});

process.on('uncaughtException', function(err) {
    console.log(err)
});

// Chat logger
bot.on('message', function (channel, user, message, self) {
	// Logging messages
	var time = new Date();
	var day = time.getDate();
	var month = time.getMonth();
	var year = time.getFullYear();
	var hours = time.getHours();
	var minutes = time.getMinutes();
	var seconds = time.getSeconds();
	var logDate = [day + '-' + month + '-' + year]
	var logTime = [hours + ':' + minutes + ':' + seconds]
	var file = './user/_' + user.username + '/logs.json'
	// The part that goes into the .json file
	var log = [
		'{' +
		'"date": ' + '"' + logDate + '", ' +
		'"time": ' + '"' + logTime + '", ' +
		'"chatter": ' + '"' + user.username + '", ' +
		'"message": ' + '"' + message + '"'
		+ '} ]}'
	]
	var logNew = [
	'{"messages": [ \n'
	+ log
	]

if (fs.existsSync(file)) {
	// Replace end of log-file
	function removeFromLog() {
		fs.readFile(file, 'utf8', function(err, data) {
    		if (err) {
    		  return console.log(err);
    		}

    		var result = data.replace("]}", ", \n");
    		fs.writeFile(file, result, 'utf8', function(err) {
    		    if (err) {
    		       return console.log(err);
    		    }
    		})
		});
	}

	// Write to log file
	function writeToLog() {
		fs.appendFile(file, log, function(err){
			if(err) {
				return console.log(err);
			}
		})
	};

	// Call both functions
	removeFromLog();
	setTimeout(writeToLog, 10);
	}
	else {
		console.log("Test")
		mkdirp('./user/_' + user.username, function(err) {}); 
		fs.appendFile(file, logNew, function(err){
			if(err) {
				return console.log(err);
		}});
	}

	if (message.startsWith("!rq")) {
		function parseJSON() {
			var obj = JSON.parse(fs.readFileSync('./user/_' + user.username + '/logs.json', 'utf8'));
			var count = Object.keys(obj.messages).length;
			var i = Math.floor(Math.random() * count);
			bot.say(channel, obj.messages[i].chatter + ': ' + obj.messages[i].message)
		}
		function giveRQ() {
			setTimeout(parseJSON, 200)
		}
		limiter.submit(giveRQ);
	};
});

// 420 timer
var job = new CronJob('00 20 16 * * *', function() {
	console.log("[DEBUG] 4:20 Timer initiated"),
	bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
	bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
	bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
	bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
	bot.say(channel, "CiGrip 420 BLAZE IT CiGrip")
	}, function () {
    console.log("[DEBUG] 4:20 Timer is over")
  },
  true
);

// Point commands
bot.on('message', function (channel, user, message, self) {
	var pointStoreFile = './user/_' + user.username + '/profile.json';
	if (message.startsWith("!addpoints")) {
		if (fs.existsSync(pointStoreFile) && (user.mod === true || user.username == channel.substring(1))) {
			pointsGet = JSON.parse(fs.readFileSync(pointStoreFile, 'utf8'))
			pointsGet.profile.points = pointsGet.profile.points + 1000
			fs.writeFile(pointStoreFile, JSON.stringify(pointsGet, null, 2))
			console.log(pointsGet)
			bot.say(channel, "Added 1000 points", message.substring(message.indexOf(" ")))
		}
	}
	if (message.startsWith("1points")) {
		if (fs.existsSync(pointStoreFile)) {
			pointsGet = JSON.parse(fs.readFileSync(pointStoreFile, 'utf8'))
			bot.say(channel, "You have " + pointsGet.profile.points + " points!")
		}
	}
});

// Update points
var updatePoints = new CronJob('*/1 * * * *', function() {
	var chatURL = "https://tmi.twitch.tv/group/user/midnan/chatters";
	request(chatURL, function (error, response, body, channel) {
		var chatters = JSON.parse(body)
		var normViewers = chatters.chatters.viewers
		var moderators = chatters.chatters.moderators
		var viewers = normViewers.concat(moderators);
		for (var i = 0; i < viewers.length; i++) {
			var profFile = './user/_' + viewers[i] + '/profile.json';
			if (fs.existsSync(profFile)) {
				var file = require(profFile);
				pointsGet = JSON.parse(fs.readFileSync(profFile, 'utf8'))
				pointsGet.profile.points = pointsGet.profile.points + 5
				fs.writeFile(profFile, JSON.stringify(pointsGet, null, 2))
			}
			else {
				var profNew =
				"{\n" +
  					'"profile": {\n' +
    					'"points": 0,\n' +
    					'"lines": 0\n' +
  					'}\n' +
				"}"
				mkdirp('./user/_' + viewers[i], function(err) {}); 
				fs.appendFile(profFile, profNew, function(err){
					if(err) {
						return;
					}
				});
			}
		}
	});
	bot.say(channel, "Succesfully added 5 points")
	console.log("Succesfully added 5 points")
	}, function () {
  },
  true
);