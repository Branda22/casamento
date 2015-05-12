$(document).ready(function(){
	console.log("i loaded!");
	$('#submit-button').on('click', function(evnt){
		// evnt.preventDefault();
		console.log("button fired")
		localStorage.setItem('email', $('#email-login').val());
	})
})