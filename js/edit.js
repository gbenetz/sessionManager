/*
 * Author: Guido Benetti guido.benetti01@gmail.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var sessions = [];

const NOERR = 0;
const NOURL = 1;
const NOTITLE = 2;
const INVURL = 3;

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
	title.addEventListener("input", enableButtons);
	titDiv.appendChild(document.createTextNode("Title: "));
	titDiv.appendChild(title)

	urlDiv.className = "urlBox"
	url.type = "text";
	url.size = url.size * 4;
	url.value = tab.url;
	url.name = "url";
	url.addEventListener("input", enableButtons);
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
 * Shows a message in the specified message pane with the specified color
 *
 * div the message pane to use
 * message is the text to show
 * color the color of the message
 * timeout is the number of seconds the message has to be shown
 */
function showMessage(div, message, color, timeout) {
	var text;
	text = document.createElement("p");
	text.appendChild(document.createTextNode(message));
	text.style.color = color;
	div.appendChild(text);
	window.setTimeout(() => {
		div.removeChild(text);
	}, timeout * 1000);
}

/**
 * Gets data from a single tab container and returns it as a tab object
 *
 * tabDiv is the DOM object of the tab container
 * Returns an object:
 * 	error is an int
 * 	tab is an object with title, url and index fields
 * If error is NOERR then tab is valid.
 * If error is NOTITLE the title was empty.
 * If error is NOURL the url was empty.
 * If error is INVURL the url was invalid.
 * In all of the 3 above cases tab is null
 */
function getSingleTab(tabDiv) {
	var index = Number.parseInt(tabDiv.getAttribute("index"));
	var title = "";
	var url = "";
	var re = /^(about:|file:|moz-extension:javascript:|data:|chrome:)/;
	for (let c of tabDiv.children) {
		var input = c.getElementsByTagName("input")[0];
		if (input.name == "title")
			title = input.value;
		else if (input.name == "url")
			url = input.value;
	}
	if (title == "")
		return {error: NOTITLE, tab: null};
	if (url == "")
		return {error: NOURL, tab: null};
	if (re.test(url))
		return {error: INVURL, tab: null};

	return {error: NOERR, tab: {title: title, url: url, index: index}};
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
	var msgDiv = document.getElementById("msg");
	if (name == "") {
		showMessage(msgDiv, "Name is empty", "red", 10);
		return;
	}
	for (let c of container.children) {
		var tab = getSingleTab(c);
		if (tab == null) {
			showMessage(msgDiv,
				    "One or more fields are empty",
				    "red",
				    10);
			return;
		}
		tabs.push();
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
	var saveBtn = document.getElementById("save");
	var name = document.getElementById("name");
	/*
	 * Load the already saved session (if any)
	 */
	browser.storage.local.get("sessions")
		.then(onGot)
		.then(onShow)
		.catch(onError);
	saveBtn.addEventListener("click", saveData);
	name.addEventListener("input", enableButtons);
});
