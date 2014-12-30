function clearTeam()
{
	localStorage.removeItem('playerPool');
}

function clearForm()
{
	$('#fname').val('');
	$('#lname').val('');
	$('#email').val('');
	$('#rating').val('');
}

function playerAdd()
{
	// Sanity check.
	if($('#fname').val() == '') {
		alert('Dude... Enter a first name, tho.')
		return;
	}
	else if($('#lname').val() == '') {
		alert('Dude... Enter a last name, tho.')
		return;
	}
	// Exclude the email check for now.
	else if($('#rating').val() == null) {
		alert('Dude... Enter a rating, tho.')
		return;
	}

	// Local vars for team.
	var playerPool;

	if(localStorage.getItem('playerPool') != null) {
		playerPool = JSON.parse(localStorage.getItem('playerPool'));
		index = playerPool.size;
	}
	else {
		playerPool = [];
	}

	// Add the new player to the team.
	var player = {};
	player.fname = $('#fname').val();
	player.lname = $('#lname').val();
	player.email = $('#email').val();
	player.rating = $('#rating').val();

	playerPool.push(player);

	// Set to local storage.
	localStorage.setItem('playerPool', JSON.stringify(playerPool));

	// Sanity check. Remove before prod.
	//console.log(playerPool);

	// Now that we're done, clear the form.
	clearForm();
}