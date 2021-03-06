var tmi = require('tmi.js');
var Twitter = require('twitter');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var func = require("./functions.js")
var clientID 	= options.identity.clientId

module.exports = {
	customCommands: function(channel, user, message, self) {
		func.connection.query('select * from commands WHERE commDesc IS NULL', function(err, result) {
			if (result[0] == undefined) return
			var commands = result.map(function(a) {return a.commName;})
			var check = new RegExp(commands.join("|")).test(message[0])
			if (check != false) {
				var commInfo = result[commands.indexOf(message[0])]
				func.command(channel, user, message, message[0], commInfo.cdType, parseInt(commInfo.cd), commInfo.response, commInfo.points)
			}
		})
	},
	google: function (channel, user, message, self) {
		if (message[0] == "!google") {
			function google() {
			var msg = message.join(" ")
			var q = msg.substring(msg.indexOf(" ") + 1);
			var question = q.split(' ').join('+');
			var base = "https://www.google.nl/search?q=";
			var link = base + question
			bot.say(channel, user.username + " Google is je beste vriend! " + link)}
			func.cooldown("google", "global", user.username, 10, google)
		}
		else if (message[0] == "!lmgtfy") {
			function lmgtfy() {
			var msg = message.join(" ")
			var q = msg.substring(msg.indexOf(" ") + 1);
			var question = q.split(' ').join('+');
			var base = "https://lmgtfy.com/?q=";
			var link = base + question
			bot.say(channel, user.username + " Google is je beste vriend! " + link)}
			func.cooldown("lmgtfy", "global", user.username, 10, lmgtfy)
		}
	},
	lastTweet: function (channel, user, message, self) {
		if (message[0] == "!lasttweet") {
			function lasttweet() {
			var client = new Twitter({
				consumer_key: options.apiKeys.twitter_consumer_key,
				consumer_secret: options.apiKeys.twitter_consumer_secret,
				access_token_key: options.apiKeys.twitter_access_token_key,
				access_token_secret: options.apiKeys.twitter_access_token_secret
			});
			client.get('statuses/user_timeline', {'screen_name': options.identity.twitter}, function(error, tweets, response) {
				bot.say(channel, "Latest tweet from @" + options.identity.twitter + ": " + tweets[0].text)
			})}
			func.cooldown("lasttweet", "global", user.username, 10, lasttweet)
		}
	},
	useTwitchAPI: function (channel, user, message, self) {
		var info = {
  			url: 'https://api.twitch.tv/kraken/streams?channel=' + channel.substring(1),
  			headers: {
  			  'Client-ID': clientID
  			}
		};
		if(message[0] == "!viewers") {
			function getViewers(error, response, body) {
			  if (!error && response.statusCode == 200) {
			    var info = JSON.parse(body).streams[0];
			    if(info != undefined) {
					bot.say(channel, channel.substring(1) + " has " + info.viewers + " viewers!")
			    }
			    else {
			    	bot.say(channel, channel.substring(1) + " is offline")
			    }
			  }
			}
			function viewers() {request(info, getViewers)}
			func.cooldown("viewers", "global", user.username, 10, viewers)
		}
		if(message[0] == "!followage") {
			function followage() {
				var usr = user.username
				var chnl = channel.substring(1)
				if (message[1]) usr = message[1]
				if (message[2]) chnl = message[2]
				request('http://api.yucibot.nl/followage/'+usr+'/'+chnl,
				function (error, response, body) {
					if(body.includes("<html>")) return
					if(body.includes("is not following")) return bot.say(channel, body)
  				bot.say(channel, usr + " has been following " + chnl + " for " + body)
				});
			}
			func.cooldown("followage", "global", user.username, 10, followage)
		}
		else if(message[0] == "!followsince") {
			function followsince() {
				var usr = user.username
				var chnl = channel.substring(1)
				if (message[1]) usr = message[1]
				if (message[2]) chnl = message[2]
				request('http://api.yucibot.nl/followsince/'+usr+'/'+chnl,
				function (error, response, body) {
					if(body.includes("<html>")) return
					if(body.includes("is not following")) return bot.say(channel, body)
					bot.say(channel, body)
				});
			}
			func.cooldown("followsince", "global", user.username, 10, followsince)
		}
		else if(message[0] == ("!game")) {
			function getGame(error, response, body) {
			  if (!error && response.statusCode == 200) {
			    var info = JSON.parse(body).streams[0];
			    if(info != undefined) {
					bot.say(channel, channel.substring(1) + " is currently playing " + info.game + "!")
			    }
			    else {
			    	bot.say(channel, channel.substring(1) + " is offline")
			    }
			  }
			}
			function game() {request(info, getGame)}
			func.cooldown("game", "global", user.username, 10, game)
		}
		else if(message[0] == "!title") {
			function getTitle(error, response, body) {
			  if (!error && response.statusCode == 200) {
			    var info = JSON.parse(body).streams[0];
			    if(info != undefined) {
					bot.say(channel, channel.substring(1) + "'s title is: " + info.channel.status + "!")
			    }
			    else {
			    	bot.say(channel, channel.substring(1) + " is offline")
			    }
			  }
			}
			function title() {request(info, getTitle)}
			func.cooldown("title", "global", user.username, 10, title)
		}
		else if(message[0] == "!uptime") {
			function getUptime(error, response, body) {
				if (!error && response.statusCode == 200) {
				  if(!body.includes("is not live")) {
						bot.say(channel, channel.substring(1) + " has been live for " + body + "!")
				  }
				  else {
				  	bot.say(channel, channel.substring(1) + " is offline")
				  }
				}
			}
			function uptime() {request("http://api.yucibot.nl/user/uptime/" + channel.substring(1), getUptime)}
			func.cooldown("uptime", "global", user.username, 10, uptime)
		}
	},
	owCommands: function (channel, user, message, self) {
		if(message[0] == "!owrank") {
			function owrank() {
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
			}}
			func.cooldown("owrank", "global", user.username, 10, owrank)
		};
	}
}
