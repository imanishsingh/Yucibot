var tmi 		= require('tmi.js');
var options 	= require('../config.js')
var connect 	= require('../app.js')
var bot 		= connect.bot
var ytApiKey 	= options.identity.ytApiKey
var request 	= require("request");
var connection 	= require("./connection.js")

module.exports = {
	getSongs: function () {
		bot.on('message', function (channel, user, message, self) {
			if (message.startsWith("!sr") || message.startsWith("!songrequest")) {
				songlink = message.split(" ")
				match(songlink, channel, user, message)
			}
			function match (songlink, channel, user, message) {
				var link = String(songlink).match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
				var id = songlink[1]
				if (link != null) {
					processYouTubeStuff(link[1], channel, user, message)
				} else if (id.length == 11){
					processYouTubeStuff(id, channel, user, message)
				} else {
					songlink.shift()
					songlist = songlink.join(" ")
					var url2 = "https://www.googleapis.com/youtube/v3/search?part=id&q=" + songlink + "&key=" + ytApiKey
					request(url2, function (error, response, body) {
						var id = JSON.parse(body).items[0].id.videoId
						processYouTubeStuff(id, channel, user, message)
					})
				}
			}
			function processYouTubeStuff(id, channel, user, message) {
				var url = "https://www.googleapis.com/youtube/v3/videos?id=" + id + "&key=" + ytApiKey + "%20&part=snippet,contentDetails,statistics,status"
				request(url, function (error, response, body) {
					info = JSON.parse(body)
					if (info.items[0] == null) {
						bot.whisper(user.username, "This is not a valid YT video :/")
						return
					}
					base = info.items[0]
					var length = base.contentDetails.duration
					var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
					var hours = 0, minutes = 0, seconds = 0, totalseconds;
				  	var matches = reptms.exec(length);
					if (matches[1]) hours = Number(matches[1]);
					if (matches[2]) minutes = Number(matches[2]);
				    if (matches[3]) seconds = Number(matches[3]);
				    totalseconds = Number(hours * 3600  + minutes * 60 + seconds);
					var title = base.snippet.title
					var srInfo = {
						title: base.snippet.title,
						thumb: base.snippet.thumbnails.default.url,
						name: user.username,
						length: totalseconds,
						songid: id
					}
					var getTime = new Date();
					connection.query('select * from songrequest where DATE_FORMAT(time,"%Y-%m-%d") = DATE_FORMAT(NOW(),"%Y-%m-%d") AND playState = 0', function(err, result) {
						var songNames = result.map(function(a) {return a.title;})
						if (songNames.indexOf(title) == -1) {
							var users = result.map(function(a) {return a.name;})
							var allNames = users.filter(function(b) {return b == user.username;});
							var result = allNames.length;
							if (result <= 2) {
								connection.query('insert into songrequest set ?', srInfo, function (err, result) {if (err) {return}})
								bot.say(user.username, "Succesfully added " + base.snippet.title + ", requested by: " + user.username + " to the queue!")
							} else {
								bot.whisper(user.username, "You have more than 3 songs in the queue, please wait a minute before you request more")
							}
						} else {
							bot.whisper(user.username, "This song has already been requested :/")
						}
					})
				}
			)}
			if (message.startsWith("!currentsong")) {
				connection.query('select * from songrequest where playState = 0 AND DATE_FORMAT(time,"%Y-%m-%d") = ?', new Date().toISOString().substr(0, 10), function(err,result){
					if(result[0] == undefined) {
						bot.say(channel, "There's no song currently playing :/")
					} else {
						bot.say(channel, "The song that is currently playing is: " + result[0].title + " requested by: " + result[0].name + " https://www.youtube.com/watch?v=" + result[0].songid)
					}
				});
			}
		});
	}
}