/*
 * Author: Guido Benetti guido.benetti01@gmail.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var sessions = [];

/**
 * Creates a row for tab data
 *
 * tab is an object containing:
 * 	title - the tab title as a string
 * 	url   - the tab url as a string
 * 	index - the tab index
 * Returns the newly created DOM object
 */
function createTabRow(tab) {
	var newDiv = document.createElement("div");
	var tabs = document.getElementsByClassName("tabs");
	var odd = (tab.index & 1) == 1;
	newDiv.className = "tab";
	if (odd) {
		newDiv.className += " odd-row"
	} else {
		newDiv.className += " even-row"
	}
	newDiv.setAttribute("index", tab.index);
//	newDiv.setAttribute("draggable", "true");
//	newDiv.addEventListener("dragstart", drag);
//	newDiv.addEventListener("dragover", allowDrop);
//	newDiv.addEventListener("drop", drop);
	var titDiv = document.createElement("div");
	titDiv.className = "titleBox"
	var title = document.createElement("input");
	title.type = "text";
	title.value = tab.title;
	title.size = title.size * 2;
	title.name = "title";
	titDiv.appendChild(document.createTextNode("Title: "));
	titDiv.appendChild(title)

	var urlDiv = document.createElement("div");
	urlDiv.className = "urlBox"
	var url = document.createElement("input");
	url.type = "text";
	url.size = url.size * 4;
	url.value = tab.url;
	url.name = "url";
	urlDiv.appendChild(document.createTextNode("URL: "));
	urlDiv.appendChild(url);

	newDiv.appendChild(titDiv);
	newDiv.appendChild(urlDiv);
	return newDiv;
}

/**
 * Retrieves data from the storage.local.get Promise.
 * It sets up all the things to show the sessions
 *
 * data the data retrieved
 */
function onGot(data) {
	console.log(data);
	if (data.hasOwnProperty("sessions")) {
		sessions = data.sessions;
	}
	return Promise.resolve(sessions);
}

/**
 * Print the error on the console
 *
 * error the error occurred
 */
function onError(error) {
	console.log(`Error: ${error}`);
}

/**
 * Creates all the DOM components needed by the page
 */
function onShow(se) {
	var params = new URLSearchParams(document.location.search.substring(1));
	var name = params.get("session");
	var nameInput = document.getElementsByName("name")[0];
	var container = document.getElementById("container")
	nameInput.value = name;
	var i = se.findIndex((e) => { return e.name == name });
	var s = se[i];
	container.setAttribute("index", i);

	for (let t of s.tabs) {
		var row = createTabRow(t);
		container.appendChild(row);
	}

	return Promise.resolve(null);
}

/*
 * Add an eventListener for the load event in order to setup things
 */
window.addEventListener("load", (e) => {
	/*
	 * Load the already saved session (if any)
	 */
	browser.storage.local.get("sessions")
		.then(onGot)
		.then(onShow)
		.catch(onError);
});
