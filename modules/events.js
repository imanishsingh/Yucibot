var tmi = require('tmi.js');
var options = require('../config.js')
var connect = require('../app.js')
var bot = connect.bot
var CronJob = require('cron').CronJob;
var request = require("request");
var func = require("./functions.js")

module.exports = {
	sub: function () {
		func.connection.query('select * from modulesettings where moduleType = "subNotif"', function(err, result) {
			bot.on("message", function (channel, username, months, message) {
				if (months != "Kappa") return
				var prePreResubMsg = result[1].message
				var preResubMsg = prePreResubMsg.replace("[username]", username); var resubMsg = preResubMsg.replace("[months]", months);
				bot.say(channel, resubMsg);
		  	var newLog = {type: "sub", log: username + " resubbed for " + months + " months to " + channel + " with the following message: " + message}
				func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
			});
			bot.on("subscription", function (channel, username, method) {
				var preSubMsg = result[1].message
				var subMsg = preSubMsg.replace("[username]", username)
				bot.say(channel, subMsg);
				var newLog = {type: "sub", log: username + " subbed to " + channel}
				func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
			});
		})
	},
	timeout: function() {
		bot.on("ban", function (channel, username, reason) {
			var newLog = {type: "timeout", log: username + " has been banned for the following reason: " + reason}
			func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
		});
		bot.on("timeout", function (channel, username, reason, duration) {
			var newLog = {type: "timeout", log: username + " has been timed out for the following reason: " + reason}
			func.connection.query('insert into adminlogs set ?', newLog, function (err, result) {if (err) {console.log(err)}})
		});
	},
	fourtwenty: function () {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		var job = new CronJob('00 20 16 * * *', function() {
			console.log("[DEBUG] 4:20 Timer initiated"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip"),
			bot.say(channel, "CiGrip 420 BLAZE IT CiGrip")
		}, function () {}, true );
	},
	twitter: function () {
		var channel = JSON.stringify(options.channels).slice(2, -2);
		new CronJob('*/20 * * * *', function() {
			bot.say(channel, "Follow me on Twitter: https://twitter.com/" + options.identity.twitter)
		}, function () {}, true );
	}
}
