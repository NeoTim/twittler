$(document).ready(function(){

	window.User = {};
	User.list = [];
	window.each = function(array, cb){
		for (var i = 0; i < array.length; i++) {
			cb(array[i], i, array);
		};
	}

	var myRootRef;
	var auth;
	var account = {
			id: "",
			uid: "",
			email: "",
			username: "",
			post: function(data){
					doPost(data);
			}
	};
	var btns = {
		logout: $("#logOutBtn"),
		showLogin: $("#showLoginBtn"),
		showSignup: $("#showSignupBtn"),
		showForgot: $("#showForgotBtn"),
		userLink: $(".link"),
		compTweet: $("#CompTweetBtn"),
		cancelTweet: $("#cancelTweetBtn")
	}
	var submits = {
		tweet: $("#writeTweetBtn"),
	}
	var blocks = {
		sideUsers : $("#userBlock"),
		tweetFeed: $("#feed"),
		compBox: $("#CompTweetBox")
	}
	var tabs = {
		feed: $("#homeFeed")
	}
	var twittlers = [];
	var $tweetBtn = $("#writeTweetBtn");
	var $tweetMsg = $("#tweetMsg");
	var $accountFeed = $("#accountFeed");
	var errors = {
		compose: {
			select: $("#composeError"),
			msg: "Please add a tweet before submitting!",
			show: function(){
				errors.compose.select.text(errors.compose.msg);
				errors.compose.select.show();
			},
			hide: function(){
				errors.compose.select.hide();
			}
		}
	}

	var init = function(){
		myRootRef = new Firebase('https://twittler-app.firebaseio.com/users/');

		auth = new FirebaseSimpleLogin(myRootRef, function(error, user) {
				if (error) {
						// an error occurred while attempting login
						alert("Error logging in: "+ error);
				} else if (user) {						
						account.id = user.id
						account.uid = user.uid
						account.email = user.email
						User.getData(user);
				} else {
						//not logged in
						showLogin();
				}
		});
		$("#loginbtn").click(function(){
				doLogin($("#loginemail").val(),$("#loginpass").val());
		})
		$("#signupbtn").click(function(){
				createNewUser($("#newemail").val(),$("#newpass").val(), $("#newUsername").val());
		})
		$("#forgotbtn").click(function(){
				doForgotPassword($("#forgotemail").val());
		})
	}

	User.init = function (){
			//console.log(users)
		myRootRef.on("value", function(snapshot){
			blocks.sideUsers.children().remove();
			_.each(snapshot.val(), function (item, index, array){
				//console.log(index);
				User.list.push({name: item.username, id: index});
				User.display(index, item);
			})
			setButtons();
		});
	}

	var setButtons = function(){
		$(".link").click(function(){
			//blocks.tweetFeed.children().remove();
			twittlers = [];
			var id = $(this).attr('id').split("_")[1];
			Tweet.getByUser(id);
			//getUserTweets(id);

		});

		$("#mtweets").click(function(){
			Tweet.getByUser(account.uid);
		});

	}
	var storeUser = function(user, username){
			var newEmail = user.email;
			var newUsername = username;
			myRootRef.child(user.uid).set({username: newUsername, email:newEmail})
	}

	var createNewUser = function(email,pass,username){
		//console.log(email+ " " +pass);
		auth.createUser(email, pass, function(error, user) {
			if (!error) {
				//console.log(user);
				storeUser(user, username);
				doLogin(email,pass);
			} else {
				alert("Could not create user: "+error);
			}
		});
	}

	var showSignup = function(){
			$("#loginbox").hide();
			$("#signupbox").show();
	}

	var showLogin = function(){
			$("#loginbox").show();
			$("#forgotbox").hide();
			$("#signupbox").hide();
			$("#userdata").hide();
			$("#accountEmail").text("");
			$("#accountUsername").text("");
			$("#twittler").hide();
	}

	var showForgotPassword = function (){
			$("#loginbox").hide();
			$("#forgotbox").show();
	}
	var showUser = function(account){
			$("#loginbox").hide();
			$("#signupbox").hide();
			$("#userdata").show();
			$("#accountEmail").text(account.email);
			$("#accountUsername").text(account.username);
			$("#twittler").show();
	}

	User.getData = function(user){
		$("#loginbox").hide();
		$("#signupbox").hide();

		myRootRef.child(user.uid).once('value', function(snapshot) {
			var U = snapshot.val();
			//console.log(snapshot.val());
			account.username = U.username;
			account.tweets = U.tweets;
			if(U.username == null){
					alert("Please add your username under settings");
			}

			showUser(account);
		});
	}




	var doLogin = function(email,pass){
		auth.login('password', {
			email: email,
			password: pass
		});
	}

	var doForgotPassword = function(email){
		auth.sendPasswordResetEmail(email, function(error,success){
			if(!error){
					alert("Password reset email sent, check your inbox!");
					showLogin();
			} else {
					alert("Error sending reset: "+error);
			}
		});
	}
	var doPost = function(data){
		var data = {
			message: data.message,
			user: data.user,
			userId: data.uid,
			//tags: data.tags,
			created_at: Firebase.ServerValue.TIMESTAMP
		};
		//myRootRef.child(account.uid).child('tweets').push(data);
		tweetsRef.push(data);
		$tweetMsg.val("");
		data = null;
	}
	var doLogout = function(){
		auth.logout();
	}
	User.display = function (id, user){
		var temp = '<a data-userid="'+id+'" data-toggle="tab" href="#userFeedTab" class="link block-item" id="link_'+id+'">@'+user.username+'</div>';
		$(temp).appendTo(blocks.sideUsers);
	}

	var saveDataForUser = function(key,value){
		myRootRef.child(userid).update({key:value});
	}
	
	btns.logout.click(function(){ doLogout() });
	btns.showLogin.click(function(){ showLogin() });
	btns.showSignup.click(function(){ showSignup() });
	btns.showForgot.click(function(){ showForgotPassword() });

	$tweetBtn.click(function(){
		var data = {};
		data.user = account.username;
		data.uid = account.uid;
		data.message = $tweetMsg.val();
		data.created_at = Firebase.ServerValue.TIMESTAMP;
		if(!data.message){
			errors.compose.show();
		} else {
			errors.compose.hide();
			Tweet.post(data);
			 blocks.compBox.hide();
			btns.compTweet.show();
			$tweetMsg.val("");
		}
	});


	var randomElement = function(collection){
  		var randomIndex = Math.floor(Math.random() * collection.length);

  		return collection[randomIndex];
  		
	};

	// random tweet generator
	var opening = ['just', '', '', '', '', 'ask me how i', 'completely', 'nearly', 'productively', 'efficiently', 'last night i', 'the president', 'that wizard', 'a ninja', 'a seedy old man'];
	var verbs = ['drank', 'drunk', 'deployed', 'got', 'developed', 'built', 'invented', 'experienced', 'fought off', 'hardened', 'enjoyed', 'developed', 'consumed', 'debunked', 'drugged', 'doped', 'made', 'wrote', 'saw'];
	var objects = ['my', 'your', 'the', 'a', 'my', 'an entire', 'this', 'that', 'the', 'the big', 'a new form of'];
	var nouns = ['cat', 'koolaid', 'system', 'city', 'worm', 'cloud', 'potato', 'money', 'way of life', 'belief system', 'security system', 'bad decision', 'future', 'life', 'pony', 'mind'];
	var tags = ['#techlife', '#burningman', '#sf', 'but only i know how', 'for real', '#sxsw', '#ballin', '#omg', '#yolo', '#magic', '', '', '', ''];

	var randomMessage = function(){
	  	return [randomElement(opening), randomElement(verbs), randomElement(objects), randomElement(nouns), randomElement(tags)].join(' ');
	};	

	
	tabs.feed.click(function(){
		Tweet.getAll();
	});
	btns.compTweet.click(function(){
		$(this).hide();
		blocks.compBox.show();
		$tweetMsg.focus();
	});
	btns.cancelTweet.click(function(){
		blocks.compBox.hide();
		btns.compTweet.show();
		$tweetMsg.val("");
	});

	

	init();
	User.init();
	var generateRandomTweet = function(){
	  	var tweet = {};
	  	tweet.user = _.sample(User.list);//randomUser(User.list);
	  	var d = new Date();
	  	var gd = d.getDay();
	  	var gy = d.getFullYear();
	  	var gm = d.getMonth();

	  	tweet.message = randomMessage();
	  	//tweet.created_at =  gd + "/" + gm + "/" + gy; //Firebase.ServerValue.TIMESTAMP;
	  	tweet.created_at =  Firebase.ServerValue.TIMESTAMP;
	  	if(tweet.user){
	  	Tweet.root.child(tweet.user.id).push({created_at: tweet.created_at, uid: tweet.user.id, user: tweet.user.name, message: tweet.message});
	  	}
	  	//console.log(tweet.user);
	  	//addTweet(tweet);
	};
	//getAllTweets();
	var scheduleNextTweet = function(){
	  generateRandomTweet();
	  setTimeout(scheduleNextTweet, Math.random() *  100000);
	};
	scheduleNextTweet();
	

});







/*	function displayToPage(item){
		var temp = $('<li data-tweetId="link_'+item.id+'" id="link_'+item.userId+'" class="link feed-list-item" style="cursor: pointer;"></div>');
		temp.html('<h4 class="feed-list-item-heading">@' + item.user + '<small class="pull-right">'+item.created_at+'</small></h4><p class="feed-list-item-text">' + item.message + '</p>');
		//temp.prependTo(blocks.tweetFeed);
		
	}*/
	/*function setHomeFeed(collection){
		//console.log(collection);
		$(blocks.tweetFeed).html("");
		_.each(collection, function (item, index, array){
			displayToPage(item);
		});
	}*/
	/*function SetUserFeed(id, user){
		

		var item = $('<li id="link_'+tweet.user+'"class="link feed-list-item" style="cursor: pointer;"></div>');
		item.html('<h4 class="feed-list-item-heading">@' + tweet.user + '<small class="pull-right">'+tweet.created_at'</small></h4><p class="feed-list-item-text">' + tweet.message + '</p>');
		item.appendTo(blocks.tweetFeed);
	}*/


		/*function getAllTweets(bool){

		tweetsRef.on("child_added", function(snapshot){
			//console.log("snapshot", snapshot.val());
			var value = snapshot.val();
			var name = snapshot.name(); 
			if(bool){
				if(value.userId == bool){
					twittlers.push({id: name, user: value.user, userId: value.userId, message: value.message, created_at: value.created_at});
				}
			} else {
					twittlers.push({id: name, user: value.user, userId: value.userId, message: value.message, created_at: value.created_at});
			}
			//_.each(snapshot.val(), function (item, index, array){
				//twittlers.push(
			//});
			iterateTweets(twittlers);
			
			btns.userLink.click(function(){
				var username = $(this).attr('id').split("_")[1];
				console.log(username);
				SetUserFeed(id, user);
			});
		});
	}

	function getUserTweets(id){
		myRootRef.child(id).child('tweets').on("value", function(snapshot){
			var value = snapshot.val();
			console.log(value);
			var name = snapshot.name(); 
			_.each(value, function (item, index, array){
				//twittlers.push(
				twittlers.push({id: index, user: item.user, userId: item.userId, message: item.message, created_at: item.created_at});
			});

			iterateTweets(twittlers);
			//console.log()
			
		});
	}*/


	/*function iterateTweets(twittlers){
		if(twittlers.length > 10){
			twittlers.sort(function(a, b) {
				return( (a.created_at > b.created_at) ? 1 : -1);
			});
			setHomeFeed(twittlers);
		} else if(twittlers.length > 5){
			twittlers.sort(function(a, b) {
				return( (a.created_at > b.created_at) ? 1 : -1);
			});
			setHomeFeed(twittlers);
		} else {
			setHomeFeed(twittlers);
		}
	}*/