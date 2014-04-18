$(document).ready(function(){
	var tweetBox = $("#feed");

	window.Tweet = {};
	var $tweetsRef = new Firebase('https://twittler-app.firebaseio.com/tweets/');	
	var tweetsArray = [];

	$tweetsRef.on("value", function(snapshot){
		tweetsArray = [];		
		var x = snapshot.val();
		_.each(x, function (item, index, array){
			//console.log(item);
			tweetsArray.push(item);
		});
		Tweet.iterateDate(tweetsArray);

	});

	var init = function(){

	}

	Tweet.all = function(){
		//cb(tweetsArray);
		return tweetsArray;

	}
	Tweet.SetDom = function(id, item){
		var temp = $('<li data-tweetId="link_'+id+'" id="link_'+item.userId+'" class="link feed-list-item" style="cursor: pointer;"></div>');
		temp.html('<h4 class="feed-list-item-heading">@' + item.user + '<small class="pull-right">'+item.created_at+'</small></h4><p class="feed-list-item-text">' + item.message + '</p>');
		$(temp).prependTo(tweetBox);
	}
	Tweet.display = function(id){
		$("#feed").html("");
		console.log(id);
		if(id){
			_.each(tweetsArray, function (item, index, array){
				if(item.userId === id) {
					Tweet.SetDom(index, item);
				}
			});
		} else {
			_.each(tweetsArray, function (item, index, array){
				Tweet.SetDom(index, item);
			});
		}
	}
	Tweet.iterateDate = function (twittlers){
		if(twittlers.length > 10){
			twittlers.sort(function(a, b) {
				return( (a.created_at > b.created_at) ? 1 : -1);
			});
			Tweet.display();
		} else if(twittlers.length > 5){
			twittlers.sort(function(a, b) {
				return( (a.created_at > b.created_at) ? 1 : -1);
			});
			Tweet.display();
			
		} else {
			Tweet.display();
		}
	}
	
	console.log(tweetsArray);

});



