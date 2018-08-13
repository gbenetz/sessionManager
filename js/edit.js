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
	var title = document.createElement("input");
	title.type = "text";
	title.value = tab.title;
	title.size = title.size * 2;
	title.name = "title";
	var url = document.createElement("input");
	url.type = "text";
	url.size = url.size * 4;
	url.value = tab.url;
	url.name = "url";
	newDiv.appendChild(document.createTextNode("Title: "));
	newDiv.appendChild(title);
	newDiv.appendChild(document.createTextNode("URL: "));
	newDiv.appendChild(url);
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

