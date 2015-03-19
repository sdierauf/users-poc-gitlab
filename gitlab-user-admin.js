// Globals

var GITLAB_ENDPOINT = "https://gitlab.cs.washington.edu/api/v3/";

function init() {
  document.getElementById('lookup-user').onclick = lookupUsers;
}

function lookupUsers() {
  //get gitlab private key
  var privateKey = document.getElementById('private-key').value;
  if (privateKey.length < 10) {
    alert("Need to put in private key!");
  }
  //make xml request
  var req = new XMLHttpRequest();
  req.open("GET", GITLAB_ENDPOINT + "users", )
  //pass to handler
}




document.onready = init;