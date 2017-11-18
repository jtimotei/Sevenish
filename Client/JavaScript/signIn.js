var main = function(){

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
}
$(document).ready(main);

// https://nodejs.org/api/https.html

// https://www.npmjs.com/package/bcrypt-nodejs

// https://letsencrypt.org/