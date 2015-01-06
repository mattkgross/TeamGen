/*
TeamGen
===========

Developer: Matthew Gross
Email: mattkgross@gmail.com
Website: http://www.mattkgross.com
Repository: https://github.com/mattkgross/TeamGen
Disclaimer: The author of this tool is not responsible for any misuse, loss, or distribution of data or information associated with this site.
This product is provided AS IS and, by using this software, the site owner agrees to all responsibility resulting from any actions taken when using this service.
Rights: This software is openly distributed and may be used, altered, and redistributed so long as credit remains given where it is due.

Copyright (C) 2014  Matthew Gross

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

=================================================================================================================================================================
*/

// Data types & enums
SexEnum = {
    MALE : 0,
    FEMALE : 1
}

function clearTeam()
{
	localStorage.removeItem('playerPool');
}

function clearForm()
{
	$('#fname').val('');
	$('#lname').val('');
	$('#email').val('');
	$('#ft').val('');
	$('#in').val('');
	$('#rating').val('');
	$('#sex').val('');
	$('#fname').fadeIn();
	$('#lname').fadeIn();
	$('#email').fadeIn();
	$('#ft').fadeIn();
	$('#in').fadeIn();
	$('#rating').fadeIn();
	$('#sex').fadeIn();
	$('#fname').focus();
}

function addComplete()
{
	$('#fname').fadeOut(400);
	$('#lname').fadeOut(400);
	$('#email').fadeOut(400);
	$('#ft').fadeOut(400);
	$('#in').fadeOut(400);
	$('#rating').fadeOut(400);	
	$('#sex').fadeOut(400, clearForm);
}

function checkFields()
{
	if($('#fname').val() == '') {
	  alert('Dude... Enter a first name, tho.');
	  $('#fname').focus();
	  return false;
	}
	else if($('#lname').val() == '') {
	  alert('Dude... Enter a last name, tho.');
	  $('#lname').focus();
	  return false;
	}
	// Exclude the email check for now.
	else if($('#ft').val() == null) {
	  alert('Dude... Enter a height, tho.');
	  $('#ft').focus();
	  return false;
	}
	else if($('#in').val() == null) {
	  alert('Dude... Enter a height, tho.');
	  $('#in').focus();
	  return false;
	}
	else if($('#rating').val() == null) {
	  alert('Dude... Enter a rating, tho.');
	  $('#rating').focus();
	  return false;
	}
	else if($('#sex').val() == null) {
	  alert('Dude... Enter a gender, tho.')
	  $('#sex').focus();
	  return false;
	}
	else {
	  return true;
	}
}

function playerAdd()
{
	// Sanity check.
	if(!checkFields()) {
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
	player.height = parseInt($('#ft').val())*12 + parseInt($('#in').val());
	player.rating = parseFloat($('#rating').val())*2;
	player.sex = parseInt($('#sex').val());

	if(!checkDup(player.fname, player.lname)) {
	  playerPool.push(player);
	}
	else {
		alert('The player you entered already exists.');
		return;
	}

	// Set to local storage.
	localStorage.setItem('playerPool', JSON.stringify(playerPool));

	// Sanity check. Remove before prod.
	//console.log(playerPool);

	// Now that we're done, clear the form.
	addComplete();
}

function checkDup(fname, lname)
{
	var playerPool = JSON.parse(localStorage.getItem('playerPool'));

	if(playerPool == null)
		return false;

	for(var i = 0; i < playerPool.length; i++) {
	  if(playerPool[i].fname == fname && playerPool[i].lname == lname) {
	  	return true;
	  }
	}

	return false;
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

	if(players == null) {
	  return;
	}

	// Could be more efficient by cutting down the array each time, but it should never be over a size of 200,
	// so I'm not going to worry about O(9n) versus O(9n - x).
	var r10 = getRatings(players, 10, true);
	var r9 = getRatings(players, 9, true);
	var r8 = getRatings(players, 8, true);
	var r7 = getRatings(players, 7, true);
	var r6 = getRatings(players, 6, true);
	var r5 = getRatings(players, 5, true);
	var r4 = getRatings(players, 4, true);
	var r3 = getRatings(players, 3, true);
	var r2 = getRatings(players, 2, true);

	// Make the relevant teams visible.
	for(var i = 1; i <= num_teams; i++) {
	  var t_name = "#col" + i.toString();
	  $(t_name).css("display", "block");
	};

	while((r10.length + r9.length + r8.length + r7.length + r6.length + r5.length + r4.length + r3.length + r2.length) > 0) {
	  for(var i = 1; i <= num_teams; i++) {
	  	var cur_col = "#col" + i.toString();
	  	var elem;

	  	// To make this more even, we cycle through 5, 1, 2, 4, 3, 4.5, 1.5, 2.5, 3.5.
	  	// Otherwise, the 1st team will always have the best players
	  	// whereas teams 2-12 may end up being the start of a new rank cycle.
	  	if(r10.length > 0) {
	  	  elem = r10.pop();
	  	}
	  	else if(r2.length > 0) {
	  	  elem = r2.pop();
	  	}
	  	else if(r4.length > 0) {
	  	  elem = r4.pop();
	  	}
	  	else if(r8.length > 0) {
	  	  elem = r8.pop();
	  	}
	  	else if(r6.length > 0) {
	  	  elem = r6.pop();
	  	}
	  	else if(r9.length > 0) {
	  	  elem = r9.pop();
	  	}
	  	else if(r3.length > 0) {
	  	  elem = r3.pop();
	  	}
	  	else if(r5.length > 0) {
	  	  elem = r5.pop();
	  	}
	  	else if(r7.length > 0) {
	  	  elem = r7.pop();
	  	}
	  	else {
	  	  break;
	  	}

	  	// Output the player.
	  	var em = (elem.email == "") ? "": ", " + elem.email;
	  	$(cur_col).append("<br><span data-toggle=\"tooltip\" data-placement=\"bottom\" data-container=\"body\" title=\"" + elem.fname + " " + elem.lname + em + ", " + Math.floor(elem.height/12) + "ft. " + elem.height%12 + "in., " + elem.rating + "\">" + elem.fname + " " + elem.lname + " (" + parseFloat(elem.rating)/2 + ", " + Math.floor(elem.height/12) + "ft." + elem.height%12 + "in.)</span>");
	  };
	};
}

function createCSV()
{
	var data = JSON.parse(localStorage.getItem('playerPool'));
	var csvContent = "First Name,Last Name,Email,Rating\n";

	for (var i = 0; i < data.length; i++) {
	  csvContent += data[i].fname + "," + data[i].lname + "," + data[i].email + "," + parseFloat(data[i].rating)/2 + "\n";
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
	if(deck == null) {
	  return null;
	}

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
	if(deck == null) {
	  return [];
	}

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
    $('#cur_players').append("<tr><td><strong>First Name</strong></td><td><strong>Last Name</strong></td><td><strong>Email</strong></td><td><strong>Height</strong></td><td><strong>Rating</strong></td></tr>");

    if(list_players != null) {
	  for (var i = 0; i < list_players.length; i++) {
	    $('#cur_players').append("<tr><td>" + list_players[i].fname + "</td><td>" + list_players[i].lname + "</td><td>" + list_players[i].email + "</td><td>" + getHeight(list_players[i].height) + "</td><td>" + parseFloat(list_players[i].rating)/2 + "</td><td><button type=\"button\" class=\"close\" style=\"float: none;\" onclick=\"deletePlayer(" + i + ")\">&times;</button></td></tr>");
	  };
	}
}

function getHeight(inches)
{
	return Math.floor(inches/12) + "' " + (inches%12) + "\"";
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

function teamRegen()
{
	window.location.href="teams.html?num_teams=" + getURLParameter('num_teams');
}

function sortBySex(list_players)
{
	// This will sort the input array with women first, O(n) complexity for those who care.
	var lastw = 0; // last woman in the front of the array

	for (var i = 0; i < list_players.length; i++) {
	  if(list_players[i].sex == SexEnum.FEMALE) {
	  	// Swap if elements aren't the same. Otherwise
	  	// just increment lastw.
	  	if(i != lastw) {
	  	  var temp = list_players[i];
	  	  list_players[i] = list_players[lastw];
	  	  list_players[lastw] = temp;
	    }
	    lastw++;
	  }
	};

	return list_players;
}