// Globals

var GITLAB_ENDPOINT = "https://gitlab.cs.washington.edu/api/v3/";

// Helper functions

//meta-ajax request taking in the necessary query string
//and the callback
function ajaxify(query, privateKey,  cb) {
  var ajax = new XMLHttpRequest();
  ajax.onload = cb;
  ajax.open("GET", GITLAB_ENDPOINT + query, true);
  ajax.setRequestHeader("PRIVATE_TOKEN", privateKey);
  ajax.send();
}

function getNetIDList(separator) {
  separator = separator || '\n'; // default split on newline
  var netIDs = document.getElementById('requested-net-ids');
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
  // Make request
  ajaxify('users', privateKey, handleUsers);
}

function handleUsers() {
  
  if (this.status != 200) {
    alert('failed to get user data!');
    return;
  }
  
  var userData = JSON.parse(this.responseText);
  console.log(userData);
  // get arr of netids
  var reqNetIDs = getNetIDList();
  var foundNetIDs = [];
  var notFoundNetIDs = [];
  // iterate through reqd netids and json list,
  for (var i = 0; i < reqNetIDs.length; i++) {
    var found = false;
    for (var j = 0; j < userData.length; j++) {
      // if netid found in res, put it nice list
      if (reqNetIDs[i] == userData[j].username) {
        foundNetIDs.push(userData[j]);
        found = true;
        break;
      }
    }
    // else, naughty list
    if (!found) {
      notFoundNetIDs.push(reqNetIDs[i]);
    }
  }

  renderTable('found-netids', foundNetIDs);
  renderTable('not-found-netids', notFoundNetIDs);
  // pass not found to admin tool
}

function renderTable(tableId, userData) {
  var tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";
  for (var i = 0; i < userData.length; i++) {
    if (typeof userData[i] != "string") {
      tableBody.appendChild(renderJSONTableElement(userData[i]))
    } else {
      tableBody.appendChild(renderStringTableElement(userData[i]));
    }
  }
}

function renderStringTableElement(data) {
  var tr = document.createElement('tr');
  tr.classList.add('failure');
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



function init() {
  document.getElementById('lookup-user').onclick = lookupUsers;
}


document.onready = init;