// the variable that stores all the information regarding the game
var game;

// the variable that stores all messages
var messages = [];

// the number of cards in hand -> useful for determining the layout of the cards
var nrOfCardsInHand;

// how the 'own cards' will be displayed
const cardPositions = 
	[[{rotationAngle:0, top:20, left:0}],[{rotationAngle:-10, top:20, left:40}, {rotationAngle:10,top:20,left:-40}],
	[{rotationAngle:-20,top:40, left:60}, {rotationAngle:0,top:20, left:0}, {rotationAngle:20,top:40, left:-60}],
	[{rotationAngle:-30,top:70, left:110}, {rotationAngle:-10,top:20,left:40}, 
	{rotationAngle:10,top:20,left:-40}, {rotationAngle:30,top:70, left:-110}]];

// how the messages will be displayed depending on sender
const messagePositions = [{message:{top: -80, left: 195}, circle1:{top: -15, left: 170}, circle2:{top: 10, left: 150}},
						{message:{top: 135, left: 180}, circle1:{top: 120, left: 165}, circle2:{top: 105, left: 150}},
						{message:{top: 135, left: 180}, circle1:{top: 120, left: 165}, circle2:{top: 105, left: 150}},
						{message:{top: 145, left: -200}, circle1:{top: 120, left: 30}, circle2:{top: 105, left: 45}}];

// the variable stores the rotation angle of the cards on the table  
var rotationTableCards = [];

// this array keeps track of whether there is or not a message displayed at a player
var messageDisplayed = [0, 0, 0, 0]; 

var pollInterval;

// the main function
// initializes the game and calls the poll function
function main() {
	var turn=0;
	$.ajax({
		type: "POST",
		url: "/HTML/getGameState",
		data: {gameId:window.location.search.substring(3)},
		dataType: 'json',
		complete: function(xhr) {
			if(xhr.responseText == "Game not found" || xhr.responseText == "Access denied") window.location.pathname = "/HTML/not_found.html";
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
	for(var player=1; player<=4; player++) {
		if(game.players.length != 2 || player == 3 || player == 1) { 
			if(messageDisplayed[player-1]) {
				var selector = player == 1? "div#ownInfo":"#player_"+player+" div.userDivs";
				var playerDiv = document.querySelector(selector).getBoundingClientRect();		
				var textbox = $("#textbox_"+(player));
				var circle1 = $("#circle1_"+(player));
				var circle2 = $("#circle2_"+(player));

				textbox.css({"top":playerDiv.top + messagePositions[player-1].message.top, 
					"left":playerDiv.left + messagePositions[player-1].message.left});
				circle1.css({"top":playerDiv.top + messagePositions[player-1].circle1.top, 
					"left":playerDiv.left + messagePositions[player-1].circle1.left});
				circle2.css({"top":playerDiv.top + messagePositions[player-1].circle2.top, 
					"left":playerDiv.left + messagePositions[player-1].circle2.left});
			}
		}
	}
}

window.adapt = function() {
	adaptMessagePositions();
}

// prints the messages in the history div
function printToHistory() {
	for(var j=0; j<messages.length; j++) {
		var mesaj; // romanian for message -> ran out of ideas for names 
		var date = new Date(messages[j].date);
		if(messages[j].sender === game.you) {
			var message='['+date.getHours()+':'+date.getMinutes()+'] '+ messages[j].message;
			mesaj = $("<div class='ownMessage'>").text(message);
		}
		else {
			var message='['+date.getHours()+':'+date.getMinutes()+'] '+game.players[messages[j].sender].username+': '+ messages[j].message;
			mesaj = $("<div class='message'>").text(message);
		}
		$("div#chat div#history").append(mesaj);
	}
	messages=[];	
}

function displayMessages() {
	messages = messages.concat(game.inbox);
	printToHistory();
	var i=0;
	if(game.inbox.length>=3) i=game.inbox.length-3;
	for(;i<game.inbox.length; i++) {
		var date = new Date(game.inbox[i].date);
		var message = '[' + date.getHours()+ ':' + date.getMinutes() + ']	' + game.inbox[i].message;
 		printMessage(message, game.inbox[i].sender);
	}
}

// the function that prints the messages send by the players
function printMessage(text, playerIndex) {
	var player;
	if(game.players.length == 2 && playerIndex == game.you) player = 0;
	else if(game.players.length == 2) player=2;
	else player = (4+(playerIndex-game.you))%4;

	var textbox;
	var circle1;
	var circle2; 

	if(messageDisplayed[player]==0) { 
		var selector = player == 0? "div#ownInfo":"#player_"+(player+1)+" div.userDivs";
		var playerDiv = document.querySelector(selector).getBoundingClientRect();

		textbox = $("<div>").attr({"class":"textbox", "id":"textbox_"+(player+1)});
		circle1 = $("<div>").attr({"class": "circle circle1", "id":"circle1_"+(player+1)});
		circle2 = $("<div>").attr({"class": "circle circle2", "id":"circle2_"+(player+1)});
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
		textbox = $("#textbox_"+(player+1));
		circle1 = $("#circle1_"+(player+1));
		circle2 = $("#circle2_"+(player+1));
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
		$("div#score").html("Your team: "+game.team1P+"<br>"+"Opponent team: "+game.team2P);
	}
	else {
		$("div#score").html("Your team: "+game.team2P+"<br>"+"Opponent team: "+game.team1P);
	}
}

// this method is used to update the icon and username of the other players
function updateOtherPlayers() {
	var i=game.you;
	$("#ownInfo").append("<img src='../Resources/Icons/"+game.players[i].icon+".png' class='icons'/>");
	$("#ownInfo").append("<p>"+game.players[i].username+"</p>");

	if(game.players.length == 2) {
		var opponent = game.you == 0? 1:0;
		$("#player_3 div.userDivs").append("<img src='../Resources/Icons/"+game.players[opponent].icon+".png' class='icons'/>");
		$("#player_3 div.userDivs").append("<p>"+game.players[opponent].username+"</p>");
	}
	else {
		for(var j=2; j<=4; j++) {
			i=(i+1)%4;
			$("#player_"+j+" div.userDivs").append("<img src='../Resources/Icons/"+game.players[i].icon+".png' class='icons'/>");
			$("#player_"+j+" div.userDivs").append("<p>"+game.players[i].username+"</p>");
		}
	}
}

function updateTurnIcon() {
	$("img#turnIcon").remove();
	if(game.turn == game.you) $("#ownInfo").append("<img src='../Resources/Icons/loading2.gif' id='turnIcon'/>");
	else if(game.players.length == 2) $("#player_3 div.userDivs").append("<img src='../Resources/Icons/loading2.gif' id='turnIcon'/>");
	else $("#player_"+((4+(game.turn-game.you))%4+1)+" div.userDivs").append("<img src='../Resources/Icons/loading2.gif' id='turnIcon'/>");
}

function endGame() {
	var endGameMessage = $("<div>").attr("id","endGameMessage");
	var text = $("<p>").text(game.result);
	var button = $("<div>").text("Main menu");
	button.attr("onclick", "window.location.href = '/HTML/menu.html'");
	endGameMessage.append(text);
	endGameMessage.append(button);
	var blackScreen = $("<div>").attr({class:"blackScreen", id:"blackScreen2"});
	blackScreen.append(endGameMessage);
	$("body").append(blackScreen);
	blackScreen.fadeIn();
}

function poll() {
	pollInterval = setInterval(function() {
		getGameState();
	}, 1000);
}

function getGameState() {
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

				if(game.result != undefined) {
					updateTableCards();
					setTimeout(endGame, 2000);
					clearInterval(pollInterval);
					return;
				}

				if(lengthOwnCards != game.cards.length) updateOwnCards();
				if(lengthTableCards != game.onTable.length) updateTableCards();
				if(game.inbox.length !=0) displayMessages();
			}
			else {
				window.location.pathname = "/HTML/not_found.html";
			}
		}
	})
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
		if(i%game.players.length==(game.players.length-1) || i == game.onTable.length-1){
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
	

	if(game.turn == game.you && game.onTable.length%game.players.length==0 && game.result==undefined) {
		var giveCardsIcon = $("<img>").attr("src", "../Resources/Icons/giveCards.png");
		giveCardsIcon.attr({id:"giveCards", onclick:"emptyTable()", onmouseenter:"changeIcon()", onmouseleave:"changeIcon()"});
		$("body").append(giveCardsIcon);
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

function isEmpty(text) {
	for(var i=0; i<text.length;i++) {
		if(text != ' ') {
			return false;
		}
	}
	return true;
}

var historyShown = false;
var inputFocused = false;
var inputShown = false;

$("div#chat input").on("focus", function() {
	inputFocused = true;
	$("div#chatButton img").attr("src","../Resources/Other/send.png");
})

$("div#chat input").on("focusout", function() {
	inputFocused = false;
	if(isEmpty($("div#chat input").val()) && !historyShown) chatSlide6();
	$("div#chatButton img").attr("src","../Resources/Other/chat.png");
})

var animationInProgress = false;

// both slide in
function chatSlide1() {
	if(!animationInProgress) {
		animationInProgress=true;
		historyShown = true;
		inputShown = true;
		$("div#chat").animate({"right": "0px"}, 150, function() {animationInProgress=false});
	}
}

// both slide out
function chatSlide2() {
	if(!animationInProgress) {
		animationInProgress=true;
		historyShown = false;
		inputShown = false;
		$("div#chat").animate({"right": "-30%"}, 150, function() {animationInProgress=false});
	}
}

// only history slide out
function chatSlide3() {	
	if(!animationInProgress) {
		animationInProgress=true;
		historyShown = false;
		inputShown = true;
		$("div#chat div#history").animate({"left": "100%"},150, function() {animationInProgress=false});
	}
}

//  only history slide in
function chatSlide4() {
	if(!animationInProgress) {
		animationInProgress=true;
		historyShown=true;
		inputShown = true;
		$("div#chat div#history").animate({"left": "0px"},150, function() {animationInProgress = false;});
	}
}

// only input box slide in
function chatSlide5() {
	if(!animationInProgress) {
		animationInProgress=true;
		historyShown=false;
		inputShown = true;
		$("div#chat div#history").css({"left": "100%"});
		$("div#chat").animate({"right": "0px"}, 150, function() {
			$("div#chat input").focus();
			animationInProgress=false;
		});
	}
}

// only input box slide out
function chatSlide6() {
	if(!animationInProgress) {
		animationInProgress=true;
		inputShown = false;
		historyShown=false;
		if(inputFocused) $("div#chat input").blur();	
		$("div#chat").animate({"right": "-30%"}, 150, function() {
			$("div#chat div#history").css({"left": "0px"});
			animationInProgress=false;
		});
	}
}

var audio;
function sendMessage() {
	var input = $("div#chat input");
	var inputVal = input.val();
	if(inputVal === "/h" || inputVal === "/h " || inputVal === "/history" || inputVal === "/history ") {
		if(historyShown) chatSlide3();
		else chatSlide4();
	}
	else if(inputVal === '/c') {
		if(historyShown) chatSlide6();
		else {
			chatSlide2();
			$("div#chat input").blur();
		}
	}
	else if(inputVal === "/never" || inputVal === "/never ") {
		if(audio != undefined) audio.pause();
		audio = new Audio('../Resources/Other/never.mp3');
		audio.play();
	}
	else if(inputVal === "/stop") {
		if(audio != undefined) audio.pause();
	}
	else if(!isEmpty(inputVal)) {
		$.ajax({
			type: "POST",
			url: "/HTML/chat",
			data: {gameId:window.location.search.substring(3), date:new Date(), message: inputVal},
			dataType: 'json',
			complete: function(xhr) {
				if(xhr.responseJSON != undefined) game.inbox = xhr.responseJSON;
				displayMessages();
			}
		});
	}
	input.val("");
}

function enterHandler() {
	if(inputShown && !inputFocused) $("div#chat input").focus();
	else if(inputShown && inputFocused) {
		sendMessage();
		if(!historyShown) chatSlide6();
	}
	else if(!inputShown) chatSlide5();

}

$("body").on("keypress", function(event) {
	var blackScreen = $("div.blackScreen");
	if(event.ctrlKey && event.keyCode==17 && blackScreen.parent().length==0) {
		if(!historyShown && !inputShown) {
			chatSlide1();
		}
		else if(!historyShown && inputShown) {
			chatSlide4()
		}
		else if(!inputFocused && isEmpty($("div#chat input").val())) {
			chatSlide2();
		}
		else {
			chatSlide3();
		}
	}
	else if(event.keyCode==13 && blackScreen.parent().length==0) enterHandler();
})

$("body").on("keyup", function() {
	if(event.keyCode==27 && inputShown && inputFocused) $("div#chat input").blur();
})

$("div#chatButton").on("mousedown", function(event) {
	if($("div#chatButton img").attr("src") == "../Resources/Other/chat.png" && !inputShown) {
		chatSlide5();
	}
	else if($("div#chatButton img").attr("src") == "../Resources/Other/send.png") {
		sendMessage();
	}
})

$(document).ready(main);