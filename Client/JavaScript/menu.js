var acc;
var profileMode=0;
function adaptContent() {
	var bar = document.querySelector("div.bar:nth-of-type(1)").getBoundingClientRect();
	var t = bar.height;
	var h = window.innerHeight - bar.height + 1;
	$("div#content").css({top:t, height:h});
	$("div#navbar").css({height:bar.height});
}

function rankToString(number) {
	if(number==undefined || !Number.isInteger(number)) return "last";
	else if(number==1) return "1st";
	else if(number==2) return "2nd";
	else if(number==3) return "3rd";
	else return number+"th";
}

function updateProfile1() {
	var greeting = $("<p id='greeting'>").text("Hi "+acc.name+",");
	var points1v1, points2v2;
	if(acc.points1v1 == undefined) points1v1 = 0;
	if(acc.points2v2 == undefined) points2v2 = 0;
	var rank1v1 = rankToString(acc.rank1v1);
	var rank2v2 = rankToString(acc.rank2v2);

	var ranking = $("<p>").text("you rank "+rank1v1+" at 1v1 with a number of points of "+points1v1+ 
		" and you rank "+rank2v2+" at 2v2 with a number of points of "+points2v2+'.');

	var winRate1v1 = $("<p>").html("<br><p class='winrates'>Your win rate at 1v1 is:</p><div class='w3-grey'><div class='w3-container w3-black w3-center' style='width:"
		+acc.winRate1v1+"%'>"+acc.winRate1v1+"%</div></div><br>");
	var winRate2v2 = $("<p>").html("<p class='winrates'>Your win rate at 2v2 is:</p><div class='w3-grey'><div class='w3-container w3-black w3-center' style='width:"
		+acc.winRate2v2+"%'>"+acc.winRate2v2+"%</div></div><br>");

	$("#contentProfile").append(greeting);
	$("#contentProfile").append(ranking);
	$("#contentProfile").append(winRate1v1);
	$("#contentProfile").append(winRate2v2);
}

function updateProfile2() {
	var table = $("<p>").text("Data not yet available.");

	$("#contentProfile").append(table);
}

function main() {
	$.ajax({
		type: "GET",
		url: "/getInfo",
		dataType: 'json',
		complete: function(xhr) {
			acc = xhr.responseJSON;
			$("#iconDiv img").attr("src","../Resources/Icons/"+acc.icon+".png");
			updateProfile1();
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
		var content = $("div#contentProfile");

		if($(this).is(":nth-of-type(1)") && profileMode != 0) {
			profileMode=0;
			content.fadeOut(100, function() {
				content.empty();
				content.css({"display": "block", opacity:0, "top": "4vmin"});
				updateProfile1();
				content.animate({top:"0vmin", opacity:1}, 300);

			});
		}
		else if($(this).is(":nth-of-type(2)") && profileMode != 1) {
			profileMode=1;
			content.fadeOut(200, function() {
				content.empty();
				content.css({"display": "block", opacity:0, "top": "4vmin"});
				updateProfile2();
				content.animate({top:"0vmin", opacity:1}, 300);
			});
		}
		$("div#options p").removeClass("selectedPMode");
		$(this).addClass("selectedPMode");
	});

	$(window).on("resize", function() {
		adaptContent();
	})

	adaptContent();

}

$(window).on("load", main);