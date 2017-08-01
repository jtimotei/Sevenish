var acc;
function adaptContent() {
	var bar = document.querySelector("div.bar:nth-of-type(1)").getBoundingClientRect();
	var t = bar.height;
	var h = window.innerHeight - bar.height + 1;
	$("div#content").css({top:t, height:h});	
}


function main() {
	$.ajax({
		type: "GET",
		url: "/getInfo",
		dataType: 'json',
		complete: function(xhr) {
			acc = xhr.responseJSON;
			$("#iconDiv img").attr("src","../Resources/Icons/"+acc.icon+".png");
			var greeting = $("<p id='greeting'>").text("Hi "+acc.name+",");
			var ranking = $("<p>").text("you rank "+acc.rank1v1+" at 1v1 with a number of points of "+acc.points1v1+ 
				" and you rank "+acc.rank2v2+" at 2v2 with a number of points of "+acc.points2v2+'.');

			var winRate1v1 = $("<p>").html("<br><p class='winrates'>Your win rate at 1v1 is:</p><div class='w3-grey'><div class='w3-container w3-black w3-center' style='width:"
				+acc.winRate1v1+"%'>"+acc.winRate1v1+"%</div></div><br>");
			var winRate2v2 = $("<p>").html("<p class='winrates'>Your win rate at 2v2 is:</p><div class='w3-grey'><div class='w3-container w3-black w3-center' style='width:"
				+acc.winRate2v2+"%'>"+acc.winRate2v2+"%</div></div><br>");

			$("#details").append(greeting);
			$("#details").append(ranking);
			$("#details").append(winRate1v1);
			$("#details").append(winRate2v2);
		}
	});

	$("div#gameModes div").on("click", function() {
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

	$("div#options p").on("click", function() {
		$("div#options p").removeClass("selectedPMode");
		$(this).addClass("selectedPMode");
	});

	$(window).on("resize", function() {
		adaptContent();
	})

	adaptContent();

}

$(window).on("load", main);