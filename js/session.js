/*
 * Author: Guido Benetti guido.benetti01@gmail.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var msgPane = null;

/**
 * Creates the div that contains all the session commands
 *
 * name is the name of the session
 * Returns:
 * the newly created div
 */
function createSessionCmds(name) {
	var cmds, btn;
	cmds = document.createElement("div");
	cmds.className = "commands";
	cmds.setAttribute("session", name);
	btn = createButton("session",
			   "start",
			   createIcon("start", "24px", "24px"),
			   "Start the session");
	btn.addEventListener("click", (e) => {
		startSession(name);
	});
	cmds.appendChild(btn);
	btn = createButton("session",
			   "edit",
			   createIcon("edit", "24px", "24px"),
			   "Edit the session");
	btn.addEventListener("click", (e) => {
		openEditPage(name);
	});
	//btn.setAttribute("disabled", "");
	cmds.appendChild(btn);
	btn = createButton("session",
			   "delete",
			   createIcon("delete", "24px", "24px"),
			   "Delete the session");
	btn.addEventListener("click", (e) => {
		showDeleteDialog(name);
	});
	cmds.appendChild(btn);
	return cmds;
}

/**
 * It creates the row for the session
 *
 * name is the name of the session
 * oddRow is a boolean indicating if the row is an odd one
 * Returns:
 * the row
 */
function createSessionRow(name, oddRow) {
	var row, empty, text;
	row = document.createElement("div");
	row.className = "session-row row ";
	if (oddRow)
		row.className += "odd-row";
	else
		row.className += "even-row";
	row.appendChild(createSessionCmds(name));
	text = document.createElement("div");
	text.className = "text";
	text.appendChild(document.createTextNode("   " + name));
	row.appendChild(text);
	return row;
}


/*
 * Callback functions used by the drag and drop interface
 */
function findDropped(dropped) {
	while (dropped.className != "container")
		dropped = dropped.parentElement;

	return dropped;
}

function preDrop(indexDrag, indexDrop) {
	var session = sessions[indexDrag];
	sessions.splice(indexDrag, 1);
	sessions.splice(indexDrop, 0, session);
	sessions.forEach((el, index) => {
		el.index = index;
	});
	console.log(sessions);
}

function getChild(div) {
	return div.firstChild;
}

function getLength() {
	return sessions.length;
}

function postDrop(indexDrag, indexDrop) {
	browser.storage.local.set({sessions : sessions}).catch(onError);
}

function getDivs() {
	return document.getElementsByClassName("container");
}
/*
 * End of drag and drop callbacks
 */

/**
 * Adds a row containing a session
 *
 * name is the name of the session
 */
function addSessionToPopup(session) {
	var container = document.getElementById("sessions-container");
	var newDiv = document.createElement("div");
	var containers = document.getElementsByClassName("container");
	var odd = (containers.length & 1) == 1;
	newDiv.className = "container";
	newDiv.setAttribute("session", session.name);
	newDiv.setAttribute("index", session.index);
	newDiv.setAttribute("draggable", "true");
	newDiv.addEventListener("dragstart", drag);
	newDiv.addEventListener("dragover", allowDrop);
	newDiv.addEventListener("drop", (ev) => {
		var funcs = {};
		var cont, divs;
		funcs.findDropped = findDropped;
		funcs.getDivs = getDivs;
		funcs.getChild = getChild;
		funcs.preDrop = preDrop;
		funcs.postDrop = postDrop;
		funcs.getLength = getLength;
		drop(ev, container, funcs);
	});
	newDiv.appendChild(createSessionRow(session.name, odd));
	container.appendChild(newDiv);
}

/**
 * Disables all the buttons not included in the dialog.
 *
 * Returns:
 * An array containing all the buttons that was already disabled when this
 * function was called
 */
function disableAllNonDialogButtons() {
	var btns = document.getElementsByTagName("button");
	var alreadyDisabled = [];
	for (let btn of btns) {
		if (btn.className.includes("dialog-cmd"))
			continue;
		if (btn.hasAttribute("disabled")) {
			alreadyDisabled.push(btn);
		} else {
			btn.setAttribute("disabled", "");
		}
	}
	return alreadyDisabled;
}

/**
 * Re-enables all the buttons except the ones specified.
 *
 * except is an array of buttons that the function will not enable
 */
function enableAllNonDialogButtons(except) {
	var btns = document.getElementsByTagName("button");
	for (let btn of btns) {
		if (!except.includes(btn))
			btn.removeAttribute("disabled");
	}
}

/**
 * Shows the overwrite dialog.
 * It creates all the required buttons with the adequate eventListeners.
 *
 * name is the name of the session that will be overwritten.
 */
function showOverwriteDialog(name) {
	var alreadyDisabled = disableAllNonDialogButtons();
	var buttons = [];
	var ok = createButton("dialog",
				"ok",
				createIcon("yes", "22px", "22px"),
				"Yes");
	ok.addEventListener("click", (e) => {
		retrieveTabs(name, true);
		enableAllNonDialogButtons(alreadyDisabled);
		dialog.parentNode.removeChild(dialog);
	});
	var cancel = createButton("dialog",
				  "cancel",
				  createIcon("no", "22px", "22px"),
				  "No");
	buttons[0] = ok;
	buttons[1] = cancel;
	var dialog = createGenericDialog(`Session "${name}" already exists: overwrite it?`, buttons);
	cancel.addEventListener("click", (e) => {
		enableAllNonDialogButtons(alreadyDisabled);
		dialog.parentNode.removeChild(dialog);
	});
	var h = document.getElementsByClassName("header")[0];
	h.insertBefore(dialog, h.firstChild);
}

/**
 * Helper function that retrieve all the tabs from the browser.
 * It is also in charge to handle the promise returned by the tabs.query method.
 *
 * session is the session name
 * overwriteSession is a boolean indicting if the session must be overwritten.
 */
function retrieveTabs(session, overwriteSession) {
	var querying = browser.tabs.query({currentWindow: true});
	querying.then(tabs => checkAndStoreTabs(tabs, session, overwriteSession))
		.catch(onError);
}

/**
 * Checks the tabs for priveleged urls and stores the unprivileged ones
 * This function stores the tabs as a session object. This object has the
 * following structure:
 * 	name	String - the session name
 * 	index	number - the index of the session in the sessions array
 * 	tabs	Array of tabs they are objects having the following structure:
 * 		title	String - the tab title
 * 		url	String - the tab url
 * 		index	number - the index of the tab
 * This function also calls the one that show the new session row
 *
 * tabs is the tabs array
 * name is the name of the session
 * overwrite is a boolean indicating that the session named name already exists
 * 	     and it must be overwritten
 */
function checkAndStoreTabs(tabs, name, overwrite) {
	var session = {};
	var filteredTabs;
	var re = /^(about:|file:|moz-extension:javascript:|data:|chrome:)/;
	session.name = name;
	session.index = sessions.length;
	filteredTabs = tabs.filter((tab) => {
		var flag = re.test(tab.url);
		if (flag)
			console.log(`url ${tab.url} not permitted`);
		return !flag;
	});
	if (filteredTabs.length == 0) {
		showMessage(msgPane,
			    "All tabs are privileged ones: session not saved",
			    "red",
			    10);
		return;
	}

	if (filteredTabs.length != tabs.length) {
		showMessage(msgPane,
			   "Some tabs omitted: privileged urls",
			   "red",
			   10);
	}
	session.tabs = filteredTabs.map((tab, index) => {
		return {title: tab.title, url: tab.url, index: index};
	});
	if (!overwrite) {
		sessions.push(session);
		addSessionToPopup(session);
	} else {
		var index = sessions.findIndex(e => e.name == name);
		session.index = index;
		sessions[index] = session;
	}

	browser.storage.local.set({sessions : sessions}).catch(onError);
}

/**
 * Saves the current session
 *
 * ev the event that triggers the save action
 */
function saveSession(ev) {
	var nameTextBox = document.getElementsByName("session-name")[0];
	name = nameTextBox.value;
	if (name == "") {
		showMessage(msgPane, "The name is required", "red", 10);
		return;
	}
	nameTextBox.value = "";
	if (sessions.some(e => e.name == name)) {
		showOverwriteDialog(name);
		return;
	}
	retrieveTabs(name, false);
}

/**
 * Starts a saved session
 *
 * name is the name of the session to start
 */
function startSession(name) {
	var creating;
	var session = sessions.find((element) => {
		return element.name == name;
	});
	urls = {url : session.tabs.map(t => t.url)};
	console.log(urls);
	creating = browser.windows.create(urls);
	creating.then((wi) => {
		console.log(`Created window ${wi.id}`);
	}).catch(onError);
}

/**
 * Shows the delete dialog.
 * It creates all the required buttons with the adequate eventListeners.
 *
 * name is the name of the session that will be deleted.
 */
function showDeleteDialog(name) {
	var alreadyDisabled = disableAllNonDialogButtons();
	var buttons = [];
	var ok = createButton("dialog",
				"ok",
				createIcon("yes", "22px", "22px"),
				"Yes");
	ok.addEventListener("click", (e) => {
		deleteSession(name);
		enableAllNonDialogButtons(alreadyDisabled);
		dialog.parentNode.removeChild(dialog);
	});
	var cancel = createButton("dialog",
				  "cancel",
				  createIcon("no", "22px", "22px"),
				  "No");
	buttons[0] = ok;
	buttons[1] = cancel;
	var dialog = createGenericDialog(`Do you really want to delete session "${name}"?`, buttons);
	cancel.addEventListener("click", (e) => {
		enableAllNonDialogButtons(alreadyDisabled);
		dialog.parentNode.removeChild(dialog);
	});
	var h = document.getElementsByClassName("header")[0];
	h.insertBefore(dialog, h.firstChild);
}

/**
 * Deletes a session
 *
 * name the name of the session to delete
 */
function deleteSession(name) {
	var index = sessions.findIndex((element) => {
		return element.name == name;
	});
	var cont = document.getElementById("sessions-container");
	var containers = document.getElementsByClassName("container");
	var toDel;
	for (let c of containers) {
		var ind = Number.parseInt(c.getAttribute("index"));
		if (c.getAttribute("session") == name) {
			toDel = c;
		}
		if (ind > index) {
			c.setAttribute("index", ind - 1);
			var fChild = c.firstChild;
			var cls = fChild.className;
			if (((ind - 1) & 1) == 0)
				fChild.className = cls.replace("odd", "even");
			else
				fChild.className = cls.replace("even", "odd");
		}
	}
	cont.removeChild(toDel);
	sessions.splice(index, 1);
	sessions.forEach((el, i) => {
		el.index = i;
	});
	browser.storage.local.set({sessions : sessions}).catch(onError);
}

function openEditPage(name) {
	var extURL = browser.extension.getURL("");
	var url = encodeURI(extURL + "/html/edit.html?session=" + name);
	var creating = browser.tabs.create({
		url : url,
		active : true
	});
	creating.then((tab) => {}).catch(onError);
}

function openHelpPage(ev) {
	var extURL = browser.extension.getURL("");
	var url = encodeURI(extURL + "/help/help.html");
	var creating = browser.tabs.create({
		url : url,
		active : true
	});
	creating.then((tab) => {}).catch(onError);
}

function loadSessions(se) {
	for (let session of sessions) {
		addSessionToPopup(session);
	}
	return Promise.resolve(sessions)
}
/**
 * Put here all the code to handle visual stuff after the sessions data are
 * loaded in the popup
 */
function handleVisualThings(se) {
	var message = document.getElementsByClassName("message")[0];
	var maxWidth = document.body.clientWidth;
	message.style.maxWidth = (maxWidth + 1).toString() + "px";
	return Promise.resolve(sessions);
}

/*
 * Add an eventListener for the load event in order to setup things and show all
 * the already saved session
 */
window.addEventListener("load", (e) => {
	msgPane = document.getElementsByClassName("message")[0];
	/*
	 * Add the eventListener to the save button
	 */
	var saveBtn = document.getElementById("session-save");
	saveBtn.addEventListener("click", saveSession);
	var helpBtn = document.getElementById("help-cmd");
	helpBtn.addEventListener("click", openHelpPage);
	var settingsBtn = document.getElementById("settings-cmd");
	settingsBtn.addEventListener("click", (ev) => {
		var opening = browser.runtime.openOptionsPage();
		opening.then(() => {}).catch(onError);
	});
	/*
	 * Load the already saved session (if any)
	 */
	browser.storage.local.get("sessions")
	.then(onGot)
	.then(loadSessions)
	.then(handleVisualThings)
	.then(((se) => {
		console.log(se);
		return Promise.resolve(null);
	}))
	.catch(onError);
});

