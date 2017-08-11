// the variable that stores all the information regarding the game
var game;

// the variable that stores all messages
var messages = [];

// the number of cards in hand -> useful for determining the layout of the cards
var nrOfCardsInHand;

// how the 'own cards' will be displayed
const cardPositions = 
	[[{rotationAngle:0, top:5, left:0}],[{rotationAngle:-10, top:6, left:4}, {rotationAngle:10,top:6,left:-4}],
	[{rotationAngle:-20,top:7, left:7}, {rotationAngle:0,top:5, left:0}, {rotationAngle:20,top:7, left:-7}],
	[{rotationAngle:-30,top:9, left:9}, {rotationAngle:-10,top:5,left:3}, 
	{rotationAngle:10,top:5,left:-3}, {rotationAngle:30,top:9, left:-9}]];

// the variable stores the rotation angle of the cards on the table  
var rotationTableCards = [];

// this array keeps track of whether there is or not a message displayed at a player
var messageDisplayed = [0, 0, 0, 0]; 

var pollInterval;
var turnTimeout;
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
			if(xhr.responseText == "Game not found" || xhr.responseText == "Access denied" || xhr.responseText=="Not authorized") window.location.pathname = "/HTML/not_found.html";
			else {
				game = xhr.responseJSON;
				if(game.players.length == 2) {
					$("div#player_3 div.userDivs").css({"background-color":"rgb(128, 0, 0)", "display":"block"});
				}
				else {
					$("div#player_3 div.userDivs").css({"background-color":"rgb(0, 51, 102)", "display":"block"});
					$("div#player_2 div.userDivs").css({"background-color":"rgb(128, 0, 0)", "display":"block"});
					$("div#player_4 div.userDivs").css({"background-color":"rgb(128, 0, 0)", "display":"block"});
				}
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

		textbox = $("div#textbox_"+(player+1));
		circle1 = $("div#circle1_"+(player+1));
		circle2 = $("div#circle2_"+(player+1));

		var message = $("<p>").text(text);
		textbox.prepend(message);

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
				$(circle1).fadeOut("normal");
				$(circle2).fadeOut("normal");
				$(textbox).fadeOut("normal", function() { $(textbox).text("") });
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
	$("#ownInfo").append("<div id='wrapper'><img src='../Resources/Icons/"+game.players[i].icon+".png' class='icons'/></div>");
	$("#ownInfo").append("<div id='username'>"+game.players[i].username+"</div>");

	if(game.players.length == 2) {
		var opponent = game.you == 0? 1:0;
		$("#player_3 div.userDivs").append("<div id='wrapper'><img src='../Resources/Icons/"+game.players[opponent].icon+".png' class='icons'/></div");
		$("#player_3 div.userDivs").append("<div id='username'>"+game.players[opponent].username+"</div>");
	}
	else {
		for(var j=2; j<=4; j++) {
			i=(i+1)%4;
			$("#player_"+j+" div.userDivs").append("<div id='wrapper'><img src='../Resources/Icons/"+game.players[i].icon+".png' class='icons'/></div>");
			$("#player_"+j+" div.userDivs").append("<div id='username'>"+game.players[i].username+"</div>");
		}
	}
}

function timeoutAnimation() {
	var timeoutWrapper = $("<div id='timeoutWrapper'>").html("<div id='timeout'></div>");
	$("body").append(timeoutWrapper);
}

function updateTurn() {
	$("img#turnIcon").remove();
	$("div#timeout").remove();
	if(game.turn == game.you) {
		$("#ownInfo").append("<img src='../Resources/Icons/loading2.gif' id='turnIcon'/>");
		turnTimeout = setTimeout(timeoutAnimation, 11500);
	}
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
					updateOwnCards();
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
			img.css("top", cardPositions[nrOfCardsInHand-1][i].top+"vmin");
			img.css("left", cardPositions[nrOfCardsInHand-1][i].left+"vmin");
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
	if(img.attr("src") == "../Resources/Icons/hand.png") img.attr("src", "../Resources/Icons/handHover.png");
	else img.attr("src", "../Resources/Icons/hand.png");
}



function updateTableCards() {
	$("#table").empty();

	updateScore();
	updateTurn();
	
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
		var giveCardsIcon = $("<img>").attr("src", "../Resources/Icons/hand.png");
		giveCardsIcon.attr({id:"giveCards", onclick:"emptyTable()", onmouseenter:"changeIcon()", onmouseleave:"changeIcon()"});
		$("div#table").append(giveCardsIcon);
	}
}

window.document.pullCard = function(card) {
	var index = card.getAttribute("data-nr");
	var topOffset = (cardPositions[nrOfCardsInHand-1][index].top-6) +"vmin";
	var leftOffset = cardPositions[nrOfCardsInHand-1][index].left;
	leftOffset = (leftOffset - (0.4 *leftOffset)) +"vmin";
	$(card).stop().animate({top:topOffset, left:leftOffset}, "easeOutExpo");
}

window.document.putCardBack = function(card) {	
	var index = card.getAttribute("data-nr");
	var topOffset = cardPositions[nrOfCardsInHand-1][index].top + "vmin";
	var leftOffset = cardPositions[nrOfCardsInHand-1][index].left+"vmin";
	$(card).stop().animate({top:topOffset, left:leftOffset}, "easeInExpo");
}

window.document.selectCard = function(c) {
	if(game.turn == game.you) {
		clearTimeout(turnTimeout);
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
	$("div#chatButton img").attr("src","../Resources/Other/chat.png");
	if(isEmpty($("div#chat input").val()) && !historyShown) chatSlide6();
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

$(window).blur(function() {
	$("div#chat input").blur();
})

$(document).ready(main);