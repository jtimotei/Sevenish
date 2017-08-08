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
				window.closeIt=true;
				if(xhr.responseJSON.message == "Game found") {
					if(window.location.search.substring(4) == "0") window.location.href= "/HTML/game1v1.html?g="+xhr.responseJSON.id;
					else window.location.href= "/HTML/game2v2.html?g="+xhr.responseJSON.id;
				} 
				else if(xhr.responseText=="Unsupported game mode"){
					window.location.href= "/HTML/not_found.html";
				}
			}
		});
	}, 2000);
}



