// Globals

var GITLAB_ENDPOINT = "https://gitlab-test.cs.washington.edu/api/v3/";

// Helper functions

//meta-ajax request taking in the necessary query string
//and the callback
function ajaxify(query, privateKey, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onload = cb;
  console.log("requesting: " + GITLAB_ENDPOINT + query);
  xhr.open("GET", GITLAB_ENDPOINT + query, true);
  xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhr.setRequestHeader("Content-Type", "text/plain");
  xhr.setRequestHeader("PRIVATE-TOKEN", privateKey);
  console.log(xhr);
  xhr.send();
}

function pruneTable(tableId) {
  document.getElementById(tableId).innerHTML = "";
}

function getNetIDList(separator) {
  return splitTextInTextArea(separator, 'requested-net-ids');
}

function splitTextInTextArea(separator, textareaID) {
  separator = separator || '\n'; // default split on newline
  var netIDs = document.getElementById(textareaID);
  if (netIDs) {
    netIDs = netIDs.value.split(separator);
    // Sanitize

    // remove all impossible netids
    var i = netIDs.length;
    while (i--) {
      if (netIDs[i].length < 2) {
        netIDs.splice(i, 1);
      }
    }
    return netIDs;
  } else {
    return [];
  }
}

function lookupUsers() {
  //get gitlab private key
  var privateKey = document.getElementById('private-key').value;
  if (privateKey.length < 10) {
    alert("Need to put in private key!");
    return;
  }
  pruneTable('found-netids');
  pruneTable('not-found-netids');
  var requestNetIDs = getNetIDList();
  requestNetIDs.forEach(function(el) {
    var query = "users?search=" + el;
    var xhr = new XMLHttpRequest();
    xhr.onload = function() { handleSingleUserLookup(xhr, el)};
    xhr.open("GET", GITLAB_ENDPOINT + query, true);
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.setRequestHeader("PRIVATE-TOKEN", privateKey);
    xhr.send();
  });
}

function handleSingleUserLookup(xhr, user) {
  console.log(user);
  console.log(xhr.status);
  if (xhr.status != 200) {
    return;
  }
  var userData = JSON.parse(xhr.responseText);
  console.log(userData);
  // userData is going to be an array of potential matches to a loookup
  // if it's empty, the user was not found
  if (userData.length == 0) {
    appendToNotFoundTable(user);
    routeToAdminAddPanel(user);
  } else {
    appendToFoundTable(userData);
  }
}

function appendToFoundTable(userData) {
  var foundTable = document.getElementById('found-netids');
  for (var i = 0; i < userData.length; i++) {
    foundTable.appendChild(renderJSONTableElement(userData[i]));
  }
}

function appendToNotFoundTable(userString) {
  document.getElementById('not-found-netids')
          .appendChild(renderStringTableElement(userString));
}

function renderStringTableElement(data) {
  var tr = document.createElement('tr');
  tr.classList.add('danger');
  var td = document.createElement('td');
  td.innerHTML = data;
  tr.appendChild(td);
  return tr;
}

function renderJSONTableElement(data) {
  var tr = document.createElement('tr');
  tr.classList.add('success');
  var userGitlabID = document.createElement('td');
  var userFullName = document.createElement('td');
  var userNetID = document.createElement('td');
  userGitlabID.innerHTML = data.id;
  userFullName.innerHTML = data.name;
  userNetID.innerHTML = data.username;
  tr.appendChild(userGitlabID);
  tr.appendChild(userFullName);
  tr.appendChild(userNetID);
  return tr;
}

function routeToAdminAddPanel(userString) {
  initAdminAddPanel();
  appendUserToAddField(userString);
}

function initAdminAddPanel() {
  // make it visible if it's not
  var adminPanel = document.getElementById('admin-add-panel');
  if (adminPanel.style.display == "none") {
    adminPanel.style.display = "";
  }
  // bind to the button
}

function appendUserToAddField(userString) {
  document.getElementById('users-to-add').value += userString + "\n";
}

function init() {
  document.getElementById('lookup-user').onclick = lookupUsers;
  // document.getElementById('admin-add-panel').style.display = "none";
}


document.onready = init;