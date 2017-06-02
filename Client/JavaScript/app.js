var main = function() {
	"use strict";
	var unread = 0;
	//document.getElementById("dialog").removeChild(document.getElementById("dialog").childNodes[0]);
	var requestMessages = function() {
		$.ajax({
			type: "GET",
			url: "/HTML/chats",
			complete: function(xhr) {
				if(xhr.status == 401){
					window.location.pathname = "/HTML/signIn.html";
					return;
				}
				else {
					if(xhr.responseJSON.messages.length !== document.getElementById("dialog").childNodes.length){
						print(xhr.responseJSON);
						if(!document.hasFocus()) {
							unread++;
							document.head.childNodes[1].innerHTML = "("+unread+") Chatter";
						} 
					} 
				}

			}
		});
	}
	requestMessages();
	setInterval(requestMessages,1000);
	
	$("button").on("click", function(event) {
			addElement();
	})
	$("input").on("keypress", function(event) {
		if(event.keyCode == 13){
			addElement();
		}
	})

	var addElement = function() {
		var input = $("input").val();
		$.ajax({
			type: "POST",
			url: "/HTML/newMessage",
			data: {message: input, time : new Date()},
			dataType: 'json'
		});
		$("input").val("");
		requestMessages();
	}

	var print = function(text) {
		$("div#dialog").empty();
		text.messages.forEach(function(data) {
			var newElement = $("<p>").text(data.author + ": " +data.message);
			if(data.color !== undefined) newElement.css("background-color","rgb("+data.color.red+","+data.color.green+","+data.color.blue+")");
			newElement.attr("data-date",data.time);
			//console.log(text);
			if(data.author == text.you){
				newElement.css("float","right");
			}
			$("div#dialog").append(newElement);
		})
	}

	$("div#logOut").on("click",function(){
		$.ajax({
			type:"GET",
			url:"/HTML/logOut",
			complete: function(){
				window.location.pathname = "/HTML/signIn.html";
			}
		});
	})
	$(window).on("focus click",function() {
		unread = 0;
		document.head.childNodes[1].innerHTML = "Chatter";
	})

}



$(document).ready(main);
