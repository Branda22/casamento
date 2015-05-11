$(document).ready(function(){
	$('#guest-form').hide();
	function fetch(){
		$("#guest-table tbody").empty()
		$.ajax({
			type: "GET",
			contentType: 'application/json',
			url: '/api/guests',
			success: function(results){
				var filter = filterData(results)
				appendToNavbar(filter);
				results.forEach(function(guest){
					appendToTable(guest.id, guest);
				})
			}
		})	
	}

	fetch();
	
	//TOGGLE ADD NEW GUEST FORM.
	$('#new-guest-btn').on('click', function(){
		$('#guest-form').slideToggle();
	})


	//SUBMIT FORM DATA TO DATABASE
	$("form").submit(function(evnt){
		evnt.preventDefault()
		var guestData = {
			name: $("#nome").val(),
			address: $("#endereco").val(),
			email: $("#email").val(),
			phone: $("#phone").val(),
			guests: $("#convidados").val(),
			confirmation: $("#presenca").val().toUpperCase()
		}

		$.ajax({
			type: "POST",
			contentType: 'application/json',
			url: '/api/guests',
			data: JSON.stringify(guestData),
			success: function(result){
				//append data to table immediatelly
				appendToTable(result.id, guestData);
				fetch();
			},
			error: function(err){
				console.log("shit happened!", err)
			}
		})

		//Remove entry from table

		//reset form values and hide form after sumbission
    	$("#nome").val("");
		$("#endereco").val("");
		$("#email").val("");
		$("#phone").val("");
		$("#convidados").val("");
		$("#presenca").val("");
		$("#guest-form").fadeOut();
	})

	$(document).on('click', '#delete', function(evnt){
		evnt.preventDefault()
		var id = $(this).closest("tr").attr('id');
		console.log("ID:", id);
		$(this).closest("tr").remove();
	})
	///////////////////////////////////////////////////////////////
	//                       HELPERS                             //
	//////////////////////////////////////////////////////////////
	
	function appendToTable(id, guestData){
		var context = {
			"SIM": "success",
			"NAO": "danger",
			"TALVEZ": "warning"
		}
		$("#guest-table tbody").append(
		'<tr class="'+ context[guestData["confirmation"]]+ '">' +
          "<td id='id'>" + id + "</td>" +
          "<td>" + guestData["name"] + "</td>" +
          "<td>" + guestData["address"] +"</td>" +
          "<td>" + guestData["email"] + "</td>" +
          "<td>" + guestData["phone"] + "</td>" +
          "<td>" + guestData["guests"] + "</td>" +
          "<td>" + guestData["confirmation"] + "</td>" +
          '<td id="delete"><span class="glyphicon glyphicon-trash red"></span></td>' +
        "</tr>").slideDown("slow");
	}

	//Filters based on yes no and maybe
	function filterData(results){
		var confirmation = {
			length: results.length,
			yes: [],
			no: [],
			maybe:[]
		}
		
		results.forEach(function(guest){
			if(guest.confirmation === "SIM"){
				confirmation.yes.push(guest)
			} else if(guest.confirmation === "NAO"){
				confirmation.no.push(guest)
			} else {
				confirmation.maybe.push(guest)
			}
		})
		return confirmation
	}

	//appends filtered results to navbar
	function appendToNavbar(results){
		$('#total span').text(results.length)
		$('#count-sim span').text(results.yes.length)
		$('#count-nao span').text(results.no.length)
		$('#count-talvez span').text(results.maybe.length)
	}
})