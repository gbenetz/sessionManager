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
	var titDiv = document.createElement("div");
	var title = document.createElement("input");
	var urlDiv = document.createElement("div");
	var url = document.createElement("input");

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
	titDiv.className = "titleBox"
	title.type = "text";
	title.value = tab.title;
	title.size = title.size * 2;
	title.name = "title";
	titDiv.appendChild(document.createTextNode("Title: "));
	titDiv.appendChild(title)

	urlDiv.className = "urlBox"
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
 * Event listener that enables the save and cancel button when something changes
 */
function enableButtons(ev) {
	var save = document.getElementById("save");
	var cancel = document.getElementById("cancel");
	if (save.hasAttribute("disabled"))
		save.removeAttribute("disabled");
	if (cancel.hasAttribute("disabled"))
		cancel.removeAttribute("disabled");
}

/**
 * Gets data from a single tab container and returns it as a tab object
 *
 * tabDiv is the DOM object of the tab container
 * Returns an object with title, url and index fields
 */
function getSingleTab(tabDiv) {
	var index = Number.parseInt(tabDiv.getAttribute("index"));
	var title = "";
	var url = "";
	for (let c of tabDiv.children) {
		var input = c.getElementsByTagName("input")[0];
		if (input.name == "title")
			title = input.value;
		else if (input.name == "url")
			url = input.value;
	}
	return {title: title, url: url, index: index};
}

/**
 * Event listener that saves data back to the browser storage data
 */
function saveData(ev) {
	var header = document.getElementById("header");
	var name = header.children[0].value;
	var container = document.getElementById("container");
	var index = Number.parseInt(container.getAttribute("index"));
	var tabs = [];
	for (let c of container.children) {
		tabs.push(getSingleTab(c));
	}
	sessions[index].tabs = tabs;
	sessions[index].name = name;
	browser.storage.local.set({sessions : sessions}).catch(onError);
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
	var i = se.findIndex((e) => { return e.name == name });
	var s = se[i];
	nameInput.value = name;
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
	var saveBtn = document.getElementById("save");
	saveBtn.addEventListener("click", saveData);
});
