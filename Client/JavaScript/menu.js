function adaptContent() {
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

	$("div.bar").on("click", function() {
		if($(this).is(":nth-of-type(1)")) {
			$("div#container").css("transform","translate(0%, 0%)");
		}
		else if($(this).is(":nth-of-type(2)")) {
			$("div#container").css("transform","translate(-50%, 0%)");
		}
		else if($(this).is(":nth-of-type(3)")) {
			$("div#container").css("transform","translate(0%, -50%)");
		}
		else {
			$("div#container").css("transform","translate(-50%, -50%)");
		}
	})

	$(window).on("resize", function() {
		adaptContent();
	})

	adaptContent();

}

$(window).on("load", main);