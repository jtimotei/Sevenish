var main = function(){

	function adaptSignUp() {
		// this could have been done with css
		// however in chrome, the layout would be correct only after a refresh.
		positionY = $("#body").height()/2 - $("div#content").height()/2;

		$("div#content").css("top",positionY);
	}
	adaptSignUp();
	$("div#content").css("display", "inline-block");

	$("div#submit").on("click", submit);

	$("input").on("keypress", function(event) {
		if(event.keyCode == 13) {
			submit();
		}
	})

	function submit(){
		$.ajax({
			type: "POST",
			url:"/HTML/checkUsername",
			data:{
				name:$("input[name='name']").val(),
				surname:$("input[name='surname']").val(),
				username: $("input[name='username']").val(),
				password:$("input[name='password']").val(),
				retype: $("input[name='retype']").val()
			},
			dataType: 'json',
			complete: function(xhr) {
				if(xhr.responseText === "Success") {
					window.location.pathname = "/HTML/success.html";
				}
				else{
					$("p#message").text("("+xhr.responseText+")");
					
				}
			}
		})
	}

	$(window).on("resize", function() {
		adaptSignUp();
	})
}
$(document).ready(main);