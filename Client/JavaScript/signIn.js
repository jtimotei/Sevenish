
var main = function(){

	function adaptLogin() {
		// this could have been done with css
		// however in chrome, the layout would be correct only after a refresh.
		positionY = $("#leftBody").height()/2 - $("div#content").height()/2;

		$("div#content").css("top",positionY);
	}

	adaptLogin();
	$("div#content").css("display", "inline-block");

	$("div#sign").on("click", submit);

	$("input").on("keypress", function(event) {
		if(event.keyCode == 13) {
			submit();
		}
	})

	function submit(){
		$.ajax({
			type: "POST",
			url:"/HTML/signIn",
			data:{
				username: $("input[name='username']").val(),
				password:$("input[name='password']").val(),
			},
			dataType: 'json',
			complete: function(xhr) {
				console.log(xhr.responseText);
				if(xhr.responseText === "Success") {
					window.location.pathname = "/HTML/menu.html";
				}
				else{
					$("p#message").text("("+xhr.responseText+")");
					
				}
			}
		})
	}

	$(window).on("resize", function() {
		adaptLogin();
	})
}
$(document).ready(main);