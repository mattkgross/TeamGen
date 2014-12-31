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
	$('#fname').fadeIn();
	$('#lname').fadeIn();
	$('#email').fadeIn();
	$('#rating').fadeIn();
	$('#fname').focus();
}

function addComplete()
{
	$('#fname').fadeOut(400);
	$('#lname').fadeOut(400);
	$('#email').fadeOut(400);
	$('#rating').fadeOut(400, clearForm);	
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
	addComplete();
}

// Source: https://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

function renderTeams()
{
	var num_teams = getURLParameter('num_teams');
	var csv_dl = getURLParameter('csv_dl');

	if(num_teams == null) {
		alert('Dude... you need to select how many teams you want to create.');
		window.location.href = "index.html";
		return;
	}

	// Generate CSV.
	if(csv_dl == "on") {
		createCSV();
	}

	// Here, we shuffle the entries so that, when sorted by rank, the subsets are randomized.
	// If needed, shuffle may then be used on each subset for further randomization.
	var players = shuffle(JSON.parse(localStorage.getItem('playerPool')), 200);

	// Could be more efficient by cutting down the array each time, but it should never be over a size of 200,
	// so I'm not going to worry about O(5n) versus O(5n - x).
	var r5 = getRatings(players, 5, true);
	var r4 = getRatings(players, 4, true);
	var r3 = getRatings(players, 3, true);
	var r2 = getRatings(players, 2, true);
	var r1 = getRatings(players, 1, true);

	// Make the relevant teams visible.
	for(var i = 1; i <= num_teams; i++) {
	  var t_name = "#col" + i.toString();
	  $(t_name).css("display", "block");
	};

	while((r5.length + r4.length + r3.length + r2.length + r1.length) > 0) {
	  for(var i = 1; i <= num_teams; i++) {
	  	var cur_col = "#col" + i.toString();
	  	var elem;

	  	// To make this more even, we cycle through 5, 1, 2, 4, 3.
	  	// Otherwise, the 1st team will always have the best players
	  	// whereas teams 2-12 may end up being the start of a new rank cycle.
	  	if(r5.length > 0) {
	  	  elem = r5.pop();
	  	  $(cur_col).append("<br>" + elem.fname + " " + elem.lname);
	  	}
	  	else if(r1.length > 0) {
	  	  elem = r1.pop();
	  	  $(cur_col).append("<br>" + elem.fname + " " + elem.lname);
	  	}
	  	else if(r2.length > 0) {
	  	  elem = r2.pop();
	  	  $(cur_col).append("<br>" + elem.fname + " " + elem.lname);
	  	}
	  	else if(r4.length > 0) {
	  	  elem = r4.pop();
	  	  $(cur_col).append("<br>" + elem.fname + " " + elem.lname);
	  	}
	  	else if(r3.length > 0) {
	  	  elem = r3.pop();
	  	  $(cur_col).append("<br>" + elem.fname + " " + elem.lname);
	  	}
	  	else {
	  	  break;
	  	}
	  };
	};
}

function createCSV()
{
	var data = JSON.parse(localStorage.getItem('playerPool'));
	var csvContent = "First Name,Last Name,Email,Rating\n";

	for (var i = 0; i < data.length; i++) {
	  csvContent += data[i].fname + "," + data[i].lname + "," + data[i].email + "," + data[i].rating + "\n";
	};

	// Source: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
	var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, "players.csv");
    }
    else {
	  var link = document.createElement("a");
	  if (link.download !== undefined) { // feature detection
	      // Browsers that support HTML5 download attribute
	      var url = URL.createObjectURL(blob);
	      link.setAttribute("href", url);
	      link.setAttribute("download", "players.csv");
	      link.style = "visibility:hidden";
	      document.body.appendChild(link);
	      link.click();
	      document.body.removeChild(link);
	  }
    }
}

function shuffle(deck, tolerance)
{
	var end = deck.length - 1;

	for (var i = 0; i < tolerance; i++) {
	  first = randomIntFromInterval(0, end);
	  second = randomIntFromInterval(0, end);

	  if(first != second) {
	    temp = deck[first];
	    deck[first] = deck[second];
	    deck[second] = temp;
	  }
	};

	return deck;
}

// Source: https://stackoverflow.com/questions/4959975/generate-random-value-between-two-numbers-in-javascript
function randomIntFromInterval(min, max)
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRatings(deck, rating, randomize)
{
	var new_deck = [];
	for (var i = 0; i < deck.length; i++) {
	  if(deck[i].rating == rating) {
	  	new_deck.push(deck[i]);
	  }
	};

	if(randomize) {
	  new_deck = shuffle(new_deck, 100);
	}

	return new_deck;
}

function startOver()
{
	var choice = confirm('Are you sure you want to erase all the current players and start over? This is not reversible. All data will be lost.');
	if(choice) {
	  clearTeam();
	  window.location.href = "index.html";
	}
}

function editPlayers()
{
    var list_players = JSON.parse(localStorage.getItem('playerPool'));
    $('#cur_players').empty();
    $('#cur_players').append("<tr><td><strong>First Name</strong></td><td><strong>Last Name</strong></td><td><strong>Email</strong></td><td><strong>Rating</strong></td></tr>");

    if(list_players != null) {
	  for (var i = 0; i < list_players.length; i++) {
	    $('#cur_players').append("<tr><td>" + list_players[i].fname + "</td><td>" + list_players[i].lname + "</td><td>" + list_players[i].email + "</td><td>" + list_players[i].rating + "</td><td><button type=\"button\" class=\"close\" style=\"float: none;\" onclick=\"deletePlayer(" + i + ")\">&times;</button></td></tr>");
	  };
	}
}

function deletePlayer(index)
{
	var list_players = JSON.parse(localStorage.getItem('playerPool'));
	list_players.splice(index, 1);
	localStorage.setItem('playerPool', JSON.stringify(list_players));
	editPlayers();
}

function sessionCheck()
{
	var exist = (JSON.parse(localStorage.getItem('playerPool')) == null) ? 0 : JSON.parse(localStorage.getItem('playerPool')).length;
	
	// If it is a new browser session and the team is still here, warn them.
	if(sessionStorage.players_set != "existing" && exist > 0) {
		$('#data_check').show();
	}

	sessionStorage.players_set = "existing";
}