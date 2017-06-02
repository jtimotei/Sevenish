var game;
function main() {
	var turn=0;
	$.ajax({
		type: "POST",
		url: "/HTML/init",
		data: {gameId:window.location.search.substring(3)},
		dataType: 'json',
		complete: function(xhr) {
			if(xhr.responseJSON.message == "Access denied") window.location.pathname = "/HTML/denied.html";
			else if(xhr.responseJSON.message == "Game not found") window.location.pathname = "/HTML/not_found.html";
			else {
				game = xhr.responseJSON;
				updateCards();
				poll();
			}
		}
	});

	$("button").on("click", function() {
		$.ajax({
			type: "POST",
			url: "/HTML/putCardOnTable",
			data: {gameId:window.location.search.substring(3), card:-1},
			dataType: 'json',
			complete: function(xhr) {
				if(xhr.responseText != "Invalid action") {
					game = xhr.responseJSON;
					updateCards();
				}
			}
		});
	})

}

function poll() {
	setInterval(function() {
		$.ajax({
			type: "POST",
			url: "/HTML/getGameState",
			data: {gameId:window.location.search.substring(3)},
			dataType: 'json',
			complete: function(xhr) {
				
				if(xhr.responseText != "Not authorized") {
					game = xhr.responseJSON;
					updateCards();
				}
			}
		})
	}, 1500);
}

function updateCards() {
	$("#player_1").empty();
	for(var i=0;i<4;i++){
		if(game.cards[i] != undefined)	$("#player_1").append("<img src='../Resources/"+game.cards[i]+".png' onclick='selectCard(this)' data-nr='"+i+"' class='cards'>");
	}
	$("#table").empty();
	if(game.onTable.length !=0) $("#table").append("<img src='../Resources/"+game.onTable[game.onTable.length-1]+".png'  class='cards'>");
}

window.document.selectCard = function(c) { 
	$.ajax({
		type: "POST",
		url: "/HTML/putCardOnTable",
		data: {gameId:window.location.search.substring(3), card:c.getAttribute("data-nr")},
		dataType: 'json',
		complete: function(xhr) {
			if(xhr.responseText != "Not your turn") {
				game = xhr.responseJSON;
				updateCards();
			}
		}
	})
}

$(document).ready(main);