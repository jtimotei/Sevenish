// the variable that stores all the information regarding the game
var game;

// the number of cards in hand -> useful for determining the layout of the cards
var nrOfCardsInHand;

// how the own cards will be displayed
const cardPositions = 
	[[{rotationAngle:0, top:20, left:0}],[{rotationAngle:-10, top:20, left:40}, {rotationAngle:10,top:20,left:-40}],
	[{rotationAngle:-20,top:40, left:60}, {rotationAngle:0,top:20, left:0}, {rotationAngle:20,top:40, left:-60}],
	[{rotationAngle:-30,top:70, left:110}, {rotationAngle:-10,top:20,left:40}, 
	{rotationAngle:10,top:20,left:-40}, {rotationAngle:30,top:70, left:-110}]];

// how the messages will be displayed depending on sender
const messagePositions = [{message:{top: 135, left: 180}, circle1:{top: 120, left: 165}, circle2:{top: 105, left: 150}},
						{message:{top: 135, left: 180}, circle1:{top: 120, left: 165}, circle2:{top: 105, left: 150}},
						{message:{top: 145, left: -200}, circle1:{top: 120, left: 30}, circle2:{top: 105, left: 45}}];

// the variable stores the rotation angle of the cards on the table  
var rotationTableCards = [];

// this array keeps track of whether there is or not a message displayed at a player
var messageDisplayed = [0, 0, 0]; 

var pollInterval;

// the main function
// initializes the game and calls the poll function
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
				updateOtherPlayers();
				updateOwnCards();
				updateTableCards();
				updateScore();
				displayMessages();
				poll();
			}
		}
	});
}

window.adaptMessagePositions = function() {
		if(messageDisplayed[1]) {
			var playerDiv = document.querySelector("#player_3 div.userDivs").getBoundingClientRect();		
			var textbox = $("#textbox_3");
			var circle1 = $("#circle1_3");
			var circle2 = $("#circle2_3");

			textbox.css({"top":playerDiv.top + messagePositions[1].message.top, 
				"left":playerDiv.left + messagePositions[1].message.left});
			circle1.css({"top":playerDiv.top + messagePositions[1].circle1.top, 
				"left":playerDiv.left + messagePositions[1].circle1.left});
			circle2.css({"top":playerDiv.top + messagePositions[1].circle2.top, 
				"left":playerDiv.left + messagePositions[1].circle2.left});
		}
	}

window.adapt = function() {
	adaptMessagePositions();
}

function displayMessages() {
	var now = new Date().getTime();
	for(var i=0;i<game.inbox.length; i++) {
		var date = new Date(game.inbox[i].date);
		if(now - date.getTime() < 60000) {
			var message = '[' + date.getHours()+ ':' + date.getMinutes() + ']	' + game.inbox[i].message;
 			printMessage(message, game.inbox[i].sender);
		}
	}
}



// the function that prints the messages send by the players
function printMessage(text, playerIndex) {
	var player = 1;
	var textbox;
	var circle1;
	var circle2; 

	if(messageDisplayed[player]==0) { 
		var playerDiv = document.querySelector("#player_"+(player+2)+" div.userDivs").getBoundingClientRect();

		textbox = $("<div>").attr({"class":"textbox", "id":"textbox_"+(player+2)});
		circle1 = $("<div>").attr({"class": "circle circle1", "id":"circle1_"+(player+2)});
		circle2 = $("<div>").attr({"class": "circle circle2", "id":"circle2_"+(player+2)});
		textbox.css({"top":(playerDiv.top + messagePositions[player].message.top), 
			"left":(playerDiv.left + messagePositions[player].message.left)}); 
		circle1.css({"top":(playerDiv.top + messagePositions[player].circle1.top), 
			"left":(playerDiv.left + messagePositions[player].circle1.left)});
		circle2.css({"top":(playerDiv.top + messagePositions[player].circle2.top), 
			"left":(playerDiv.left + messagePositions[player].circle2.left)});

		var message = $("<p>").text(text);
		textbox.prepend(message);

		textbox.hide();
		circle1.hide();
		circle2.hide();
		$("body").append(textbox);
		$("body").append(circle1);
		$("body").append(circle2);
		textbox.fadeIn();
		circle1.fadeIn();
		circle2.fadeIn();
	}
	else {
		textbox = $("#textbox_"+(player+2));
		circle1 = $("#circle1_"+(player+2));
		circle2 = $("#circle2_"+(player+2));
		var message = $("<p>").text(text);
		if(messageDisplayed[player]>2) {
			textbox.children().last().remove();
			messageDisplayed[player]--;
		}
		message.hide();
		textbox.prepend(message);
		message.fadeIn();
	}

	messageDisplayed[player]++;

	setTimeout(function() {
		if(message.parent().length > 0) {
			messageDisplayed[player]--;
			if(messageDisplayed[player]==0) {
				$(circle1).fadeOut("normal", function() { circle1.remove(); });
				$(circle2).fadeOut("normal", function() { circle2.remove(); });
				$(textbox).fadeOut("normal", function() { textbox.remove(); });
			} else{			
				message.fadeOut();
			}
		}
	}, 5500);
}

// this method updates the score seen in the upper-left corner of the window
function updateScore() {
	$("div#score").empty();
	if(game.you%2==0) {
		$("div#score").html("You: "+game.team1P+"<br>"+"Opponent: "+game.team2P);
	}
	else {
		$("div#score").html("You: "+game.team2P+"<br>"+"Opponent: "+game.team1P);
	}
}

// this method is used to update the icon and username of the other players
function updateOtherPlayers() {
	var opponent = game.you == 0? 1:0;
	$("#ownInfo").append("<img src='../Resources/Icons/"+game.players[game.you].icon+".png' class='icons'/>");
	$("#ownInfo").append("<p>"+game.players[game.you].username+"</p>");

	$("#player_3 div.userDivs").append("<img src='../Resources/Icons/"+game.players[opponent].icon+".png' class='icons'/>");
	$("#player_3 div.userDivs").append("<p>"+game.players[opponent].username+"</p>");
}

function updateTurnIcon() {
	$("img#turnIcon").remove();
	if(game.turn == game.you) $("#ownInfo").append("<img src='../Resources/Icons/loading2.gif' id='turnIcon'/>");
	else $("#player_3 div.userDivs").append("<img src='../Resources/Icons/loading2.gif' id='turnIcon'/>");
}

function endGame(response) {
	clearInterval(pollInterval);
	var endGameMessage = $("<div>").attr("id","endGameMessage");
	var text = $("<p>").text(response.result);
	var button = $("<div>").text("Main menu");
	button.attr("onclick", "window.location.href = '/HTML/menu.html'");
	endGameMessage.append(text);
	endGameMessage.append(button);
	var blackScreen = $("<div>").attr({class:"blackScreen", id:"blackScreen2"});
	blackScreen.append(endGameMessage);
	game.team1P = response.team1P;
	game.team2P = response.team2P;
	updateScore();
	$("body").append(blackScreen);
	blackScreen.fadeIn();
}

function poll() {
	pollInterval = setInterval(function() {
		$.ajax({
			type: "POST",
			url: "/HTML/getGameState",
			data: {gameId:window.location.search.substring(3)},
			dataType: 'json',
			complete: function(xhr) {
				if(xhr.responseText != "Not authorized" && xhr.responseText != "Game not found") {		
					if(xhr.responseJSON.result != undefined) {
						endGame(xhr.responseJSON);
						return;
					}
					var lengthOwnCards = game.cards.length;
					var lengthTableCards = game.onTable.length;
					game = xhr.responseJSON;
					if(lengthOwnCards != game.cards.length) updateOwnCards();
					if(lengthTableCards != game.onTable.length) updateTableCards();
					if(game.inbox.length !=0) displayMessages();
				}
			}
		})
	}, 2000);
}

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

window.document.zoomOutCards = function() {
	var blackScreen = $("div#blackScreen1");
	blackScreen.fadeOut(200, function() {
		blackScreen.remove();
	});
}

window.document.zoomInCards = function() {
	var blackScreen = $("<div>").attr({class:"blackScreen", id:"blackScreen1", onclick:"zoomOutCards()"});
	var p = $("<p>");
	for(var i=0;i<game.onTable.length;i++) {
		var img = $("<img>").attr({src:"../Resources/Cards/"+game.onTable[i]+".png", draggable:false});
		p.append(img);
		if(i%4==3 || i == game.onTable.length-1){
			blackScreen.append(p);
			p = $("<p>");
		}	
	}
	$("body").append(blackScreen);
	blackScreen.fadeIn(300);
}

window.document.changeIcon = function() {
	var img = $("#giveCards");
	if(img.attr("src") == "../Resources/Icons/giveCards.png") img.attr("src", "../Resources/Icons/giveCardsHover.png");
	else img.attr("src", "../Resources/Icons/giveCards.png");
}

function updateTableCards() {
	$("#table").empty();

	updateScore();
	updateTurnIcon();
	
	window.document.zoomOutCards();

	if(game.onTable.length == 0) {
		rotationTableCards = [];
		return;
	}

	for(var i=0; i<game.onTable.length;i++) {
		var img = $("<img>").attr({src:"../Resources/Cards/"+game.onTable[i]+".png", onclick:"zoomInCards()", draggable:false, class:"cards"});
		if(rotationTableCards[i] == undefined) {
			rotationTableCards.push(Math.random()*25-10);
		}
		img.css("transform", "translate(-50%, -50%) rotate("+rotationTableCards[i]+"deg)");
		$("#table").append(img);
	}
	

	if(game.turn == game.you && game.onTable.length%game.players.length==0) {
		var giveCardsIcon = $("<img>").attr("src", "../Resources/Icons/giveCards.png");
		giveCardsIcon.attr({id:"giveCards", onclick:"emptyTable()", onmouseenter:"changeIcon()", onmouseleave:"changeIcon()"});
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

var inputFocused;

window.document.removeInput = function() {
	var input = $("input#chat");
	var inputVal = input.val();
	var remove = true;
	for(var i=0; i<inputVal.length;i++) {
		if(inputVal[i] != ' ') {
			remove = false;
			break;
		}
	}

	if(remove) {
		input.fadeOut(100, function() {input.val("");});
	}
	else {
		inputFocused = false;
	}
}

$("body").on("keypress", function(event) {
	var blackScreen = $("div.blackScreen");
	if(event.keyCode == 13 && blackScreen.parent().length==0) {
		var input = $("input#chat");
		var inputVal = input.val();
		if(input.css("display") == "none"){
			input.fadeIn(100);
			input.focus();
			inputFocused = true;
		}
		else if(!inputFocused) {
			input.focus();
			inputFocused = true;
		}
		else {
			input.fadeOut(100, function() {input.val("");});
			inputFocused = false;
			$.ajax({
				type: "POST",
				url: "/HTML/chat",
				data: {gameId:window.location.search.substring(3), date:new Date(), message: inputVal},
				dataType: 'json'
			});
		}
	}
})

$(document).ready(main);