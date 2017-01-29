var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var request = require("request");
var cd = require("./cooldown.js")
var connection = require("./connection.js")
var clientID 	= options.identity.clientId

module.exports = {
	customCommands: function(channel, user, message, self) {
		connection.query('select * from commands WHERE commDesc IS NULL', function(err, result) {
			var comm = message.split(" ")[0]
			var commands = result.map(function(a) {return a.commName;})
			var check = new RegExp(commands.join("|")).test(comm)
			if (check != false) {
				var commInfo = result[commands.indexOf(comm)]
				cd.command(channel, user, message, comm, commInfo.cdType, parseInt(commInfo.cd), commInfo.response)
			}
		})
	},
	basicCommands: function (channel, user, message, self) {
		if (message.startsWith("!google")) {
			function google() {
			var q = message.substring(message.indexOf(" ") + 1);
			var question = q.split(' ').join('+');
			var base = "https://www.google.nl/search?q=";
			var link = base + question
			bot.say(channel, user.username + " Google is je beste vriend! " + link)}
			cd.cooldown("google", "global", usewr.username, 10, google)
		}
		else if (message.startsWith("!lmgtfy")) {
			function lmgtfy() {
			var q = message.substring(message.indexOf(" ") + 1);
			var question = q.split(' ').join('+');
			var base = "https://lmgtfy.com/?q=";
			var link = base + question
			bot.say(channel, user.username + " Google is je beste vriend! " + link)}
			cd.cooldown("lmgtfy", "global", user.username, 10, lmgtfy)
		}
		else if (message.includes("Alliance") || message.includes("alliance")) {
			bot.say(channel, "LOK'TAR OGAR, FOR THE HORDE SMOrc")
		};
	},
	useTwitchAPI: function (channel, user, message, self) {
		var info = {
  			url: 'https://api.twitch.tv/kraken/streams?channel=' + channel.substring(1),
  			headers: {
  			  'Client-ID': clientID
  			}
		};
		if(message.startsWith("!viewers")) {
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
			cd.cooldown("viewers", "global", user.username, 10, viewers)
		}
		else if(message.startsWith("!game")) {
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
			cd.cooldown("game", "global", user.username, 10, game)
		}
		else if(message.startsWith("!title")) {
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
			cd.cooldown("title", "global", user.username, 10, title)
		}
	},
	owCommands: function (channel, user, message, self) {
		if(message.startsWith("!owrank")) {
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
			cd.cooldown("owrank", "global", user.username, 10, owrank)
		};
	}
}