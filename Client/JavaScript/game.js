var game;
var nrOfCardsInHand;
const cardPositions = 
	[[{rotationAngle:0, top:0, left:0}],[{rotationAngle:-10, top:0, left:40}, {rotationAngle:10,top:0,left:-40}],
	[{rotationAngle:-20,top:20, left:60}, {rotationAngle:0,top:0, left:0}, {rotationAngle:20,top:20, left:-60}],
	[{rotationAngle:-30,top:50, left:110}, {rotationAngle:-10,top:0,left:40}, 
	{rotationAngle:10,top:0,left:-40}, {rotationAngle:30,top:50, left:-110}]];

var rotationTableCards = [];

function main() {
	var turn=0;
	$.ajax({
		type: "POST",
		url: "/HTML/init",
		data: {gameId:window.location.search.substring(3)},
		dataType: 'json',
		complete: function(xhr) {
			if(xhr.responseText == "Access denied") window.location.pathname = "/HTML/denied.html";
			else if(xhr.responseText == "Game not found") window.location.pathname = "/HTML/not_found.html";
			else {
				game = xhr.responseJSON;
				updateOwnCards();
				updateTableCards();
				poll();
			}
		}
	});
}

function poll() {
	setInterval(function() {
		$.ajax({
			type: "POST",
			url: "/HTML/getGameState",
			data: {gameId:window.location.search.substring(3)},
			dataType: 'json',
			complete: function(xhr) {
				if(xhr.responseText != "Not authorized" && xhr.responseText != "Game not found") {
					var lengthOwnCards = game.cards.length;
					var lengthTableCards = game.onTable.length;
					game = xhr.responseJSON;
					if(lengthOwnCards != game.cards.length) updateOwnCards();
					if(lengthTableCards != game.onTable.length) updateTableCards();

				}
			}
		})
	}, 2000);
}

/*function updateStand() {
	$("#player_2").empty();
	$("#player_2").html("Team 1: "+game.team1P+"<br>Team 2: "+game.team1P+"<br>Turn: "+game.players[game.turn].username);
}*/

function updateOwnCards() {
	$("#player_1").empty();
	nrOfCardsInHand = game.cards.length;
	for(var i=0;i<4;i++){
		if(game.cards[i] != undefined) {
			var img = $("<img>").attr({src:"../Resources/Cards/"+game.cards[i]+".png", 
				class:"cards", 
				'data-nr':i, 
				onclick:"selectCard(this)", 
				onmouseenter:"pullCard(this)",
				onmouseleave:"putCardBack(this)",
				draggable:false
			});
			img.css("transform", "rotate("+cardPositions[nrOfCardsInHand-1][i].rotationAngle+"deg)");
			img.css("top", cardPositions[nrOfCardsInHand-1][i].top);
			img.css("left", cardPositions[nrOfCardsInHand-1][i].left);
			$("#player_1").append(img);
		}
	}
}


function updateTableCards() {
	$("#table").empty();

	if(game.onTable.length == 0) {
		rotationTableCards = [];
		return;
	}

	for(var i=0; i<game.onTable.length;i++) {
		var img = $("<img>").attr({src:"../Resources/Cards/"+game.onTable[i]+".png", draggable:false, class:"cards"});
		if(rotationTableCards[i] == undefined) {
			rotationTableCards.push(Math.random()*25-10);
		}
		img.css("transform", "translate(-50%, -50%) rotate("+rotationTableCards[i]+"deg)");
		$("#table").append(img);
	}
	

	if(game.turn == game.you && game.onTable.length%4==0) {
		var giveCardsIcon = $("<img>").attr("src", "../Resources/Icons/giveCards.ico");
		giveCardsIcon.attr({id:"giveCards", onclick:"emptyTable()"});
		$("#player_1").append(giveCardsIcon);
	}
}

window.document.pullCard = function(card) {
	var index = card.getAttribute("data-nr");
	var topOffset = cardPositions[nrOfCardsInHand-1][index].top-50;
	var leftOffset = cardPositions[nrOfCardsInHand-1][index].left;
	leftOffset = leftOffset - (0.4 *leftOffset);
	$(card).stop().animate({top:topOffset, left:leftOffset}, "easeOutExpo");
}

window.document.putCardBack = function(card) {	
	var index = card.getAttribute("data-nr");
	var topOffset = cardPositions[nrOfCardsInHand-1][index].top;
	var leftOffset = cardPositions[nrOfCardsInHand-1][index].left;
	$(card).stop().animate({top:topOffset, left:leftOffset}, "easeInExpo");
}

window.document.selectCard = function(c) {
	if(game.turn == game.you) {
		$.ajax({
			type: "POST",
			url: "/HTML/putCardOnTable",
			data: {gameId:window.location.search.substring(3), card:c.getAttribute("data-nr")},
			dataType: 'json',
			complete: function(xhr) {
				if(xhr.responseText != "Invalid action") {
					game = xhr.responseJSON;
					updateOwnCards();
					updateTableCards();
				}
			}
		})
	}
}

window.document.emptyTable = function() {
		$.ajax({
			type: "POST",
			url: "/HTML/putCardOnTable",
			data: {gameId:window.location.search.substring(3), card:-1},
			dataType: 'json',
			complete: function(xhr) {
				if(xhr.responseText != "Invalid action") {
					game = xhr.responseJSON;
					updateOwnCards();
					updateTableCards();
				}
			}
		});
	}

$(document).ready(main);