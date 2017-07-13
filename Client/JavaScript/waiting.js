/**
* A request has a date/id so we distinguish them. 
* The page polls the server with the same id. On the server side we try to match players. 
* When we have found a match we redirect them to a page. When they will request the page they will get the other players. 
* Every move one players make are sent to the server with that id so we know who made what move in what game. 
*/

var id = new Date().getTime();


$.ajax({
		type: "POST",
		url: "/HTML/playQueue",
		data: {date:id, lastSent:id, gameMode:window.location.search.substring(4)},
		dataType: 'json',
		complete: function() {
			poll();
		}
	});

function poll() {
	setInterval(function request() {
		var currentTime = new Date();
		$.ajax({
			type: "POST",
			url: "/HTML/search",
			data: {date:id, lastSent:currentTime.getTime(), gameMode:window.location.search.substring(4)},
			dataType: 'json',
			complete: function(xhr) {
				if(xhr.responseJSON.message == "Game found") {
					window.location.href= "/HTML/game.html?g="+xhr.responseJSON.id;
				}
			}
		});
	}, 2000);
}



