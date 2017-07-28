window.adaptContent = function() {
	var bar = document.querySelector("div.bar:nth-of-type(1)").getBoundingClientRect();
	var t = bar.height;
	var h = window.innerHeight - bar.height;
	$("div#content").css({top:t, height:h});	
}

function main() {
	$("button").on("click", function() {
		gameMode = this.getAttribute("data-gamemode")-0;
		window.open("/HTML/waiting.html?gm="+gameMode);
	})

	adaptContent();
}

$(document).ready(main);