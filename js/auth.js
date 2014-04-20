$(document).ready(function(){	
	window.each = function(array, cb){
		for (var i = 0; i < array.length; i++) {
			cb(array[i], i, array);
		};
	}
/*
	VARS ======================= VARS
*/	
	var auth;
	window.User = {};
	window.Account = {id: "", uid: "", email: "", username: ""};
	window.Genorator = {};
/*
	VARS ======================= VARS
*/
	// page --- VARS	
	//$myRootRef;
	$usersRef = new Firebase('https://twittler-app.firebaseio.com/users/');
	User.list = [];
	$sideUsers = $("#userBlock"),
	$Feed = $("#feed"),
	$myTweetsBtn = $("#mtweets");
	$allTweetsBtn = $("#homeFeed");


	// login / signup --- VARS
	$logoutBtn = $("#logOutBtn");
	$showLoginBtn = $(".showLoginBtn");
	$showSignupBtn = $("#showSignupBtn");
	$showForgotBtn = $("#showForgotBtn");
	$loginBox = $("#loginbox");
	$signupBox = $("#signupbox");
	$forgotBox = $("#forgotbox");
	$userData = $("#userdata");
	$twittler = $("#twittler");
	$loginError = $("#loginError");
	$signupError = $("#signupError");
	$forgotError = $("#forgotError");
	$forgotSuccess = $("#forgotSuccess");

	// composeTweet --- VARS
	$compBox = $("#CompTweetBox")
	$compTweetBtn = $("#CompTweetBtn");
	$tweetBtn = $("#writeTweetBtn");
	$tweetMsg = $("#tweetMsg");
	$compError = $("#composeError");
	$cancelTweet = $("#cancelTweetBtn");
	
/*
	OPTIONS ======================= OPTIONS
*/	

	// page --- OPTIONS
	Tweet.allTweets = function(){
		$Feed.find(".tweet").show();
	}
	Tweet.myTweets = function(){
		$Feed.find(".tweet").show();
		$Feed.find(".tweet").not("."+Account.username).hide();
	}

	// login / signup --- OPTIONS
	Account.showSignup = function(){
		$loginBox.hide(); 
		$signupBox.show().find("input").first().focus();
	}
	Account.showLogin = function(){
			$loginBox.show().find("input").first().focus();
			$signupBox.hide();
			$forgotBox.hide();
			$twittler.hide();
	}
	Account.showForgotPassword = function (){
			$loginBox.hide();
			$forgotBox.show().find("input").first().focus();
	}
	Account.showUser = function(Account){
			$loginBox.hide();
			$signupBox.hide();
			$("#accountEmail").text(Account.email);
			$("#accountUsername").text(Account.username);
			$twittler.show();
	}
	Account.ShowloginError = function(error, box, show){
			
		if(show){
			var msg = error.message.split(": ")[2];
			console.log(msg);
			box.show().find("p").text(msg);
		} else {
			box.hide().find("p").text("");
		}
	}
	// composeTweet --- OPTIONS
	var showCompError = function(show){
		if(show){ $compError.slideDown()} else {$compError.slideUp()}
	}
	var showCompBox = function(show){
		if(show){ $compTweetBtn.hide(); $compBox.show().find("textarea").focus();
		} else { $compTweetBtn.show(); $compBox.hide(); showCompError(false); $tweetMsg.val("")  };
	}
/*
 	EVENTS ======================= EVENTS
*/

	// page --- EVENTS
	$myTweetsBtn.on("click", function(e){e.stopPropagation();e.preventDefault();Tweet.myTweets()});
	$allTweetsBtn.on("click", function(e){e.stopPropagation();e.preventDefault(); Tweet.allTweets()});

	// login / signup --- EVENTS
	$logoutBtn.on("click", function(){ Account.doLogout() });
	$showLoginBtn.on("click", function(){ Account.showLogin() });
	$showForgotBtn.on("click", function(){ Account.showForgotPassword() });
	$showSignupBtn.on("click", function(){ Account.showSignup() });

	// composeTweet --- EVENTS
	$compTweetBtn.on("click", function(){showCompBox(true)});
	$cancelTweet.on("click", function(){ showCompBox(false)});
	$tweetBtn.click(function(){
		var data = {};
		data.user = Account.username;
		data.uid = Account.uid;
		data.message = $tweetMsg.val();
		data.created_at = Firebase.ServerValue.TIMESTAMP;
		if(!data.message){showCompError(true);} else {Tweet.post(data);showCompBox(false);}
	});
	Account.init = function(){
		auth = new FirebaseSimpleLogin($usersRef, function(error, user) {
				if (error) {
						Account.ShowloginError(error,$loginError, true);
				} else if (user) {						
						Account.id = user.id
						Account.uid = user.uid
						Account.email = user.email
						Account.getData(user);
				} else {
						//not logged in
						Account.showLogin();
				}
		});
		$("#loginbtn").click(function(){Account.doLogin($("#loginemail").val(),$("#loginpass").val())})
		$("#signupbtn").click(function(){Account.createNewUser($("#newemail").val(),$("#newpass").val(), $("#newUsername").val())})
		$("#forgotbtn").click(function(){Account.doForgotPassword($("#forgotemail").val())})
	}
	Account.storeUser = function(user, username){
			var newEmail = user.email;
			var newUsername = username;
			$usersRef.child(user.uid).set({username: newUsername, email:newEmail})
	}
	Account.createNewUser = function(email,pass,username){
		if(!username){
				Account.ShowloginError({message: ": : Please input a Username"}, $signupError, true);
		} else {
			auth.createUser(email, pass, function(error, user) {
				
				 if (!error) {
					Account.storeUser(user, username);
					doLogin(email,pass);
				} else  {
					Account.ShowloginError(error,$signupError, true);
					//alert("Could not create user: "+error);
				}
			});
		}
	}
	Account.getData = function(user){
		$usersRef.child(user.uid).once('value', function(snapshot) {
			var U = snapshot.val();
			Account.username = U.username;
			Account.tweets = U.tweets;
			if(U.username == null){
					//Account.ShowloginError("Please input a Username", $signupError, true);
			}
			Account.showUser(Account);
		});
	}
	Account.doLogin = function(email,pass){
		auth.login('password', {email: email,password: pass});
	}
	Account.doForgotPassword = function(email){
		auth.sendPasswordResetEmail(email, function(error,success){
			if(!error){
					//alert("Password reset email sent, check your inbox!");
					Account.showLogin();
					Account.ShowloginError({message: ": : An email was sent containing your new password!!"}, $forgotSuccess, true);
			} else {
				Account.ShowloginError(error, $forgotError, true);
					//alert("Error sending reset: "+error);
			}

		});
	}
	Account.doLogout = function(){
		auth.logout();
	}
	User.init = function (){
		$usersRef.on("value", function(snapshot){
			$sideUsers.children().remove();
			_.each(snapshot.val(), function (item, index, array){
				User.list.push({name: item.username, id: index});
				User.display(index, item);
			});
		});
	}
	User.display = function (id, user){
		//data-toggle="tab" href="#userFeedTab"
		var temp = '<a data-userid="'+id+'"  class="'+user.username+' link block-item" id="link_'+id+'">@'+user.username+'</div>';
		$(temp).appendTo($sideUsers);

		$("."+user.username).on("click", function(){
			//console.log("hello")
			$("#feed").find(".tweet").show();
			$("#feed").find(".tweet").not("."+user.username).hide();
		});
	}
	
	




		
	
	// Get Current Signed in User
	Account.init();
	// Get all users.
	User.init();


	

/*
	Genorator ======================= Genorator
*/	

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


	// I MUST CALL USER.init() before i can auto generate
 	Genorator.generateRandomTweet = function(){
	  	var tweet = {};
	  	tweet.user = _.sample(User.list);//randomUser(User.list);
	  	var d = new Date();
	  	var gd = d.getDay();
	  	var gy = d.getFullYear();
	  	var gm = d.getMonth();

	  	tweet.message = randomMessage();
	  	tweet.created_at =  Firebase.ServerValue.TIMESTAMP;
	  	if(tweet.user){
	  	Tweet.root.child(tweet.user.id).push({created_at: tweet.created_at, uid: tweet.user.id, user: tweet.user.name, message: tweet.message});
	  	}
	  	//console.log(tweet.user);
	};
	Genorator.scheduleNextTweet = function(){
	  Genorator.generateRandomTweet();
	  setTimeout(Genorator.scheduleNextTweet, Math.random() *  1000000);
	};
	Genorator.scheduleNextTweet();
	

});

