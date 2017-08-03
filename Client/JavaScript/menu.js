var acc;
var profileMode=0;
var table1, table2;
function adaptContent() {
	var bar = document.querySelector("div.bar:nth-of-type(1)").getBoundingClientRect();
	var t = bar.height;
	var h = window.innerHeight - bar.height + 1;
	$("div#content").css({top:t, height:h});
	$("div#navbar").css({height:bar.height});
}

function rankToString(number) {
	if(!Number.isInteger(number)) return "last";
	else if(number==1) return "1st";
	else if(number==2) return "2nd";
	else if(number==3) return "3rd";
	else return number+"th";
}

function updateProfile1() {
	if(acc.message == "Error retrieving data.") {
		$("#contentProfile").text("Error retrieving data.");
		return; 
	}
	$("#iconDiv img").attr("src","../Resources/Icons/"+acc.icon+".png");
	var greeting = $("<p id='greeting'>").text("Hi "+acc.name+",");
	var rank1v1 = rankToString(acc.rank1v1);
	var rank2v2 = rankToString(acc.rank2v2);

	var ranking = $("<p>").text("you rank "+rank1v1+" at 1v1 with a number of points of "+acc.points1v1+ 
		" and you rank "+rank2v2+" at 2v2 with a number of points of "+acc.points2v2+'.');

	var winRate1v1 = $("<p>").html("<br><p class='winrates'>Your win rate at 1v1 is:</p><div class='w3-grey'><div class='w3-container w3-black w3-center' style='width:"
		+acc.winRate1v1+"%'>"+acc.winRate1v1+"%</div></div><br>");
	var winRate2v2 = $("<p>").html("<p class='winrates'>Your win rate at 2v2 is:</p><div class='w3-grey'><div class='w3-container w3-black w3-center' style='width:"
		+acc.winRate2v2+"%'>"+acc.winRate2v2+"%</div></div><br>");

	$("#contentProfile").append(greeting);
	$("#contentProfile").append(ranking);
	$("#contentProfile").append(winRate1v1);
	$("#contentProfile").append(winRate2v2);
}

function createTableRankings(table) {

	if(table1.message == "Error retrieving data.") {
		return $("<p>").text("Error retrieving data.");
	}

	var t = $("<table class='rankings'>");
	var row=$("<tr>");
	row.append($("<td>").text("Rank"));
	row.append($("<td>").text("Username"));
	row.append($("<td>").text("Points"));
	t.append(row);

	for(var i=0; i<table.list.length; i++) {
		var row=$("<tr>");
		row.append($("<td>").text(i+1));
		row.append($("<td>").text(table.list[i].username));
		row.append($("<td>").text(table.list[i].points));
		t.append(row);
	}

	return t;
}

function updateProfile2() {
	$("#contentProfile").append($("<p>").text("Rankings at 1v1"));
	$("#contentProfile").append(createTableRankings(table1));
	$("#contentProfile").append($("<p>").text("Rankings at 2v2"));
	$("#contentProfile").append(createTableRankings(table2));
}

function main() {
	$.ajax({
		type: "GET",
		url: "/getInfo",
		dataType: 'json',
		complete: function(xhr) {
			acc = xhr.responseJSON;
			updateProfile1();			
		}
	});

	$.ajax({
		type: "GET", url: "/top1v1", dataType: 'json',
		complete: function(xhr) {
			table1 = xhr.responseJSON;
		}
	});

	$.ajax({
		type: "GET", url: "/top2v2", dataType: 'json',
		complete: function(xhr) {
			table2 = xhr.responseJSON;
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