$(document).ready(function(){
	$('#guest-form').hide();
	function fetch(){
		$("#guest-table tbody").empty()
		$.ajax({
			type: "GET",
			contentType: 'application/json',
			url: '/api/guests',
			success: function(results){
				var count = 0
				console.log("RESULTS", results);
				if(results){
					var filter = filterData(results)
					appendToNavbar(filter);
					results.forEach(function(guest){
						count++;
						appendToTable(guest.id, guest, count);
					})
				}
			}
		})
	}

	fetch();

	//TOGGLE ADD NEW GUEST FORM.
	$('#new-guest-btn').on('click', function(){
		$("#presenca").val('SIM');
		$('#convidados').val('1');
		$('#edit-btn').hide();
		$('#submit-btn').show();
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
			guests: $("#convidados").val() || "1",
			owner: $("#convidado_por").val(),
			confirmation: $("#presenca").val().toUpperCase() || "SIM"
		}
		console.log("guest data:", guestData);

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

		//reset form values and hide form after sumbission
		resetForm();
	})

	//edit table row.
	var editId = 0;
	$(document).on('click', '#edit', function(evnt){
		editId = $(this).attr('value');
		$('#edit-btn').show();
		$('#submit-btn').hide();
		evnt.preventDefault();
		$.ajax({
			type: "GET",
			contentType: 'application/json',
			url: '/api/guests/' + editId,
			success: function(result){
				console.log('EDIT RESULT:', result)
		    $("#nome").val(result.name);
				$("#endereco").val(result.address);
				$("#email").val(result.email);
				$("#phone").val(result.phone);
				$("#convidados").val(result.guests || "SIM");
				$("#convidado_por").val(result.owner),
				$("#presenca").val(result.confirmation || "SIM");
				$('#guest-form').slideToggle();

			},
			error: function(err){
				console.log("shit happened!", err)
			}
		})
	})

	//submit put request to database
	$(document).on('click', '#edit-btn', function(evnt){
		evnt.preventDefault();
		editData = {
			name: $("#nome").val(),
			address: $("#endereco").val(),
			email: $("#email").val(),
			phone: $("#phone").val(),
			guests: $("#convidados").val(),
			owner: $("#convidado_por").val(),
			confirmation: $("#presenca").val().toUpperCase()
		}
		$.ajax({
			type: "PUT",
			contentType: 'application/json',
			url: '/api/guests/' + editId + '/edit',
			data: JSON.stringify(editData),
			success: function(result){
				console.log("PUT RESULT", result)
				resetForm();
				fetch();
			},
			error: function(err){
				console.log("PUT ERROR", err)
			}
		})
	})

	//Remove entry from table
	$(document).on('click', '#delete', function(evnt){
		evnt.preventDefault()
		var $that = $(this);
		bootbox.confirm("Tem certeza que quer deletar este convidado?", function(result){
			if(result){
				var id = $that.attr('value');
				console.log("ID:", id);
				$that.closest("tr").remove();
				$.ajax({
					type: 'DELETE',
					contentType: 'application/json',
					url: '/api/guests/delete/' + id,
					success: function(result){
						console.log("DELETED:", result)
						fetch()
					},
					error: function(err){
						console.log("Something went wrong on the delete", err);
					}
				})
			}
		});
	})

	$(document).on('click', '#cancel-btn', function(evnt){
		evnt.preventDefault();
		resetForm();
	})
	///////////////////////////////////////////////////////////////
	//                       HELPERS                             //
	//////////////////////////////////////////////////////////////

	function appendToTable(id, guestData, num){
		var context = {
			"SIM": "success",
			"NAO": "danger",
			"TALVEZ": "warning"
		}
		$("#guest-table tbody").append(
		'<tr class="'+ context[guestData["confirmation"]]+ '">' +
          '<td value="' + num + '" id="id">' + num + '</td>' +
          "<td>" + guestData["name"] + "</td>" +
          "<td>" + guestData["address"] +"</td>" +
          "<td>" + guestData["email"] + "</td>" +
          "<td>" + guestData["phone"] + "</td>" +
          "<td>" + guestData["guests"] + "</td>" +
          "<td>" + guestData["owner"] + "</td>" +
          "<td>" + guestData["confirmation"] + "</td>" +
          '<td value="' + id + '" id="edit"><span class="glyphicon glyphicon-pencil green"></span></td>' +
          '<td value="' + id + '" id="delete"><span class="glyphicon glyphicon-trash red"></span></td>' +
        "</tr>").slideDown("slow");
	}

	//Filters based on yes no and maybe
	function filterData(results){
		var confirmation = {
			length: results.length,
			yes: 0,
			no: 0,
			maybe: 0,
			totalGuests: 0
		}

		results.forEach(function(guest){
			confirmation.totalGuests += parseInt(guest.guests);
			if(guest.confirmation === "SIM"){
				confirmation.yes += parseInt(guest.guests);
			} else if(guest.confirmation === "NAO"){
				confirmation.no += parseInt(guest.guests);
			} else {
				confirmation.maybe += parseInt(guest.guests);
			}
		})
		return confirmation
	}

	//appends filtered results to navbar
	function appendToNavbar(results){
		$('#total span').text(results.totalGuests)
		$('#count-sim span').text(results.yes)
		$('#count-nao span').text(results.no)
		$('#count-talvez span').text(results.maybe)
	}

	//Clears form inputs and hides form
	function resetForm(){
    $("#nome").val("");
		$("#endereco").val("");
		$("#email").val("");
		$("#phone").val("");
		$("#convidados").val("")
		$("#convidado_por").val(),
		$("#presenca").val("");
		$("#guest-form").slideUp();
	}
})
