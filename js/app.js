$(document).ready(function(){
	var tweetBox = $("#feed");
	var userTweetBox = $("#UsersFeed");
	
	var orderByDate = function(array, cb){
		array.sort(function(a, b) {
			return( (a.created_at > b.created_at) ? 1 : -1);
		});
		return array;
	}
	var iterateTweets = function(collection){		
		_.each(collection, function (item, index, array){
			_.each(item, function (it, i, ar){
				it.id = i;
				//console.log(it)
				Tweet.list.push(it);

			});
		});
		Tweet.list = orderByDate(Tweet.list);
		return Tweet.list;
	}
	
	window.Tweet = {
		list: [],
		userList: [],		
		root: new Firebase('https://twittler-app.firebaseio.com/tweets/'),
		getUrl: function(userId){
			Tweet.userList = [];
			Tweet.root.child(userId).on("child_added", function(snap){
				var name = snap.name();
				var obj = snap.val();
				obj.id = name;
				Tweet.userList.push(obj);
				
			});
			return Tweet.userList;
		},
		findByUser: function(userId){				
				return  _.where(Tweet.list, {uid: userId});
		},
		getAll: function(array){
				var list = iterateTweets(array);
				//console.log(snap.val());
				Tweet.displayTweets(list, tweetBox);
		},
		getByUser: function(userId){
			//console.log(Tweet.findByUser(userId));
			//console.log(Tweet.getUrl(userId));
			Tweet.displayTweets(Tweet.findByUser(userId), userTweetBox);
			
		},
		displayByUser: function(){

		},
		displayTweets: function(collection, box){
			box.children().remove();
			_.each(collection, function (item, index, array){
				//console.log(item.uid);
				Tweet.SetDom(item.uid, item, box);
			});
		}
	};
	var $tweetsRef = new Firebase('https://twittler-app.firebaseio.com/tweets/');	
	var $tweetsChild = function(id){
		return new Firebase('https://twittler-app.firebaseio.com/tweets/'+ id);
	}
	var tweetsArray = [];
	var UserTweets = [];
	

	Tweet.SetDom = function(id, item, box){
		//console.log(item);
		var dat = new Date(item.created_at);
		var newDate = dat.toLocaleDateString();
		var temp = $('<li data-tweetId="link_'+id+'" id="tweetSelect_'+id+'" data-toggle="tab" class="tweetListBtn feed-list-item" style="cursor: pointer;"></li>');
		temp.html('<h4 class="feed-list-item-heading">@' + item.user + '<small class="pull-right">'+newDate+'</small></h4><p class="feed-list-item-text">' + item.message + '</p>');
		$(temp).prependTo(box);
		
	}
	Tweet.displayFeed = function(collection, box){
		box.children().remove();
		_.each(collection, function (item, index, array){
			//console.log(item);
			//Tweet.SetDom(index, item, box);
		});
	}
	Tweet.display = function(collection, box){
		box.html("");
		_.each(collection, function (item, index, array){
			_.each(collection, function (it, i, ar){
				//console.log(index)
				Tweet.SetDom(index, item, box);
			});
		});
	}
	Tweet.iterateDate = function (twittlers, box){
		//console.log(twittlers);
		if(twittlers.length > 10){
			twittlers.sort(function(a, b) {
				return( (a.created_at > b.created_at) ? 1 : -1);
			});
			Tweet.displayFeed(twittlers, box);
		} else if(twittlers.length > 5){
			twittlers.sort(function(a, b) {
				return( (a.created_at > b.created_at) ? 1 : -1);
			});
			Tweet.displayFeed(twittlers, box);
			
		} else {
			Tweet.displayFeed(twittlers, box);
		}
	}
	Tweet.post = function(data){
		$tweetsRef.child(data.uid).push(data);
	}
	var arrayInfo = function(collection){
		var Lengths = [];
		var L;
		_.each(collection, function (item, index, array){
			var newArray = [];
			
			_.each(item, function (it, i, ar){
				newArray.push(it);
			});
			L = newArray.length;
			
			Lengths.push({uid: index, le: L, data: newArray});
		});
		//console.log(Lengths);
		return Lengths;
	}
	var validate = function(newList){
		var v;
		var list = Tweet.list;
		var result = {};
		_.each(newList, function (item, index, array){
			v = _.where(list, {uid: item.uid});
			//console.log(item.le, v.length);
			if(item.le >  v.length){
				result.valid = "Fail";
				result.uid = item.uid;
			} else if(item.le < v.length) {
				result.valid = "Fail";
				result.uid = item.uid;
			}
		});
		if(result.valid === "Fail"){
			return true;
		} else {
			return false;
		}
	}
	var watcher = function(snapList){
		
		var newList = arrayInfo(snapList);
		var V = validate(newList);
		if(V){
			console.log(V, "Something was updated in the Firebase, So we will call Tweet.getAll()");
			initAll();
		} else {
			console.log("Everything is working properly");
		}
	}

	
	function newData(){
		Tweet.root.on('value', function(snap){
			var L = Tweet.list.length;
			watcher(snap.val());
		});
	}
	function initAll(){
		Tweet.root.once('value', function(snap){
			Tweet.list = [];
			Tweet.getAll(snap.val());
			newData();
		});
	}
	initAll();
});



