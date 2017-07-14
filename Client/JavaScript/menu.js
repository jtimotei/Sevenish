function main() {
	$("button").on("click", function() {
		gameMode = this.getAttribute("data-gamemode")-0;
		window.open("/HTML/waiting.html?gm="+gameMode);
	})
}

$(document).ready(main);