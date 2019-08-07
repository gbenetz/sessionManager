/*
 * Author: Guido Benetti guido.benetti01@gmail.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var sessions = [];
var sessionName = "";
var sessionIndex = -1;
var trash = [];
var unsaved = false;

const NOERR = 0;
const NOURL = 1;
const NOTITLE = 2;
const INVURL = 3;

/**
 * Event handler that allows the drop of an object on the target
 */
function allowDrop(ev) {
	ev.preventDefault();
}

/**
 * Event handler that manages the dragging of a session row
 */
function drag(ev) {
	ev.dataTransfer.setData("index", ev.target.getAttribute("index"));
}

/**
 * Event handler that manages the dropping of a session row on another.
 * It manages also the sessions indexes.
 */
function drop(ev) {
	ev.preventDefault();
	var indexDrag = Number.parseInt(ev.dataTransfer.getData("index"), 10);
	var indexDrop, dropped = ev.target;
	var divs = document.getElementsByClassName("tab");
	var dragged;
	var session = sessions[indexDrag];
	var container = document.getElementById("container");

	while (!dropped.className.includes("tab"))
		dropped = dropped.parentElement;

	indexDrop = Number.parseInt(dropped.getAttribute("index"), 10);
	if (indexDrag == indexDrop)
		return;

	for (let div of divs) {
		var index = Number.parseInt(div.getAttribute("index"), 10);
		var cls, newIndex;
		if (index == indexDrag) {
			dragged = div;
			div.setAttribute("index", indexDrop);
		} else {
			if (indexDrop > indexDrag) {
				if (index == indexDrop + 1) {
					dropped = div;
				} else if (index > indexDrag &&
					   index <= indexDrop) {
					div.setAttribute("index", index - 1);
				} else
					continue;
			} else {
				if (index >= indexDrop && index < indexDrag) {
					div.setAttribute("index", index + 1);
				} else
					continue;
			}
		}
		cls = div.className;
		newIndex = Number.parseInt(div.getAttribute("index"), 10);
		if ((newIndex & 1) == 0)
			div.className = cls.replace("odd", "even");
		else
			div.className = cls.replace("even", "odd");

	}
	if (indexDrop == sessions.length - 1)
		container.appendChild(dragged);
	else
		container.insertBefore(dragged, dropped);

	unsaved = true;
	enableButtons();
}

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
	var odd = (tab.index & 1) == 1;
	var titDiv = document.createElement("div");
	var title = document.createElement("input");
	var urlDiv = document.createElement("div");
	var url = document.createElement("input");
	var iconDiv = document.createElement("div")
	var dataDiv = document.createElement("div")
	var empty = document.createElement("div");
	var deleteDiv, btn;
	iconDiv.className = "iconBox";
	iconDiv.appendChild(createIcon("drag", 25, 25, false));
	empty.className = "empty";
	empty.appendChild(document.createTextNode("\xA0"));
	iconDiv.appendChild(empty);

	newDiv.className = "tab";
	if (odd) {
		newDiv.className += " odd-row"
	} else {
		newDiv.className += " even-row"
	}
	newDiv.setAttribute("index", tab.index);
	newDiv.setAttribute("original-index", tab.index);
	newDiv.setAttribute("draggable", "true");
	newDiv.addEventListener("dragstart", drag);
	newDiv.addEventListener("dragover", allowDrop);
	newDiv.addEventListener("drop", drop);
	titDiv.className = "titleBox"
	title.type = "text";
	title.defaultValue = tab.title;
	title.size = title.size * 2;
	title.name = "title";
	title.addEventListener("input", changeListener);
	titDiv.appendChild(document.createTextNode("Title: "));
	titDiv.appendChild(title)

	urlDiv.className = "urlBox"
	url.type = "text";
	url.size = url.size * 4;
	url.defaultValue = tab.url;
	url.name = "url";
	url.addEventListener("input", changeListener);
	urlDiv.appendChild(document.createTextNode("URL: "));
	urlDiv.appendChild(url);

	deleteDiv = document.createElement("div");
	deleteDiv.className = "deleteBox"
	empty = document.createElement("div");
	empty.className = "empty";
	empty.appendChild(document.createTextNode("\xA0"));
	btn = createButton("row",
			   "delete",
			   createIcon("delete", "24px", "24px", false),
			   "Delete the tab");
	btn.addEventListener("click", deleteListener);
	deleteDiv.appendChild(empty);
	deleteDiv.appendChild(btn);

	dataDiv.className = 'dataBox';

	newDiv.appendChild(iconDiv);
	dataDiv.appendChild(titDiv);
	dataDiv.appendChild(urlDiv);
	dataDiv.appendChild(deleteDiv);
	newDiv.appendChild(dataDiv);

	return newDiv;
}

/**
 * Event listener to add a new empty tab
 */
function newListener(ev) {
	var container = document.getElementById("container");
	var tab = {
		index:	sessions[sessionIndex].tabs.length,
		title:	"",
		url:	""
	};
	var newTab = createTabRow(tab);
	newTab.setAttribute("new", "");
	container.appendChild(newTab);
	unsaved = true;
	enableButtons();
}

/**
 * Event listener to delete a tab
 */
function deleteListener(ev) {
	var container = document.getElementById("container");
	var el = ev.target;
	var i, inputs, flag;
	while (!el.className.includes("tab"))
		el = el.parentElement;

	container.removeChild(el);
	i = 0;
	for (let c of container.children) {
		c.setAttribute("index", i);
		i++;
	}

	inputs = el.getElementsByTagName("input");
	flag = false;
	for (let inp of input) {
		if (inp.defaultValue != "" || inp.value != "") {
			flag = true;
			break;
		}
	}

	if (flag) {
		trash.push(el);
		unsaved = true;
		enableButtons();
	}
}

/**
 * Event listener that handles the disabling and enabling of the buttons when
 * something changes.
 */
function changeListener(ev) {
	var inputs = document.getElementsByTagName("input")
	for (let txt of inputs) {
		if (txt.type == "text" && txt.value != txt.defaultValue) {
			unsaved = true;
			enableButtons();
			return;
		}
	}

	unsaved = false;
	disableButtons();
	console.log(ev)
}

/**
 * Event listener that reset all the page to default
 */
function resetPage(ev) {
	var tabs;
	var container = document.getElementById("container");
	var inputs;

	for (let tab of trash) {
		container.appendChild(tab);
	}

	trash = [];
	inputs = document.getElementsByTagName("input");
	for (let txt of inputs) {
		if (txt.type == "text") {
			txt.value = txt.defaultValue;
		}
	}

	tabs = document.getElementsByClassName("tab");
	for (let t of tabs) {
		if (t.hasAttribute("new")) {
			container.removeChild(t);
		}
	}

	tabs = document.getElementsByClassName("tab");
	for (var i = 0; i < tabs.length; i++) {
		t = Array.prototype.filter.call(tabs, (e) => {
			var oi = e.getAttribute("original-index");
			return Number.parseInt(oi, 10) == i;
		});
		t[0].setAttribute("index", i);
		container.appendChild(t[0]);
	}

	unsaved = false;
	disableButtons();
}

/**
 * Shows a colored border on the specified element
 *
 * div the element to use
 * color the color of the border
 * width the width of the border in px
 * timeout is the number of seconds the border has to be shown
 */
function showBorder(div, color, width, timeout) {
	div.style.border = "" + width + "px " + color + " " + "solid";
	window.setTimeout(() => {
		div.style.border = "";
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
	var urlIn = null;
	var re = /^(about:|file:|moz-extension:javascript:|data:|chrome:)/;
	var dataBox = tabDiv.getElementsByClassName("dataBox")[0];
	for (let c of dataBox.children) {
		var input = c.getElementsByTagName("input")[0];
		if (input == undefined)
			continue;
		if (input.name == "title")
			title = input.value;
		else if (input.name == "url") {
			url = input.value;
			urlIn = input;
		}
	}
	if (title == "")
		return {error: NOTITLE, tab: null};
	if (url == "")
		return {error: NOURL, tab: null};
	if (re.test(url))
		return {error: INVURL, tab: null};
	try {
		let u = new URL(url);
	} catch(TypeError) {
		url = "http://" + url;
		urlIn.value = url;
	}

	return {error: NOERR, tab: {title: title, url: url, index: index}};
}

/**
 * Enables the save and cancel buttons
 */
function enableButtons() {
	var saveBtn = document.getElementById("save");
	var cancelBtn = document.getElementById("cancel");
	if (saveBtn.hasAttribute("disabled"))
		saveBtn.removeAttribute("disabled");
	if (cancelBtn.hasAttribute("disabled"))
		cancelBtn.removeAttribute("disabled");
}

/**
 * Disables the save and cancel buttons
 */
function disableButtons() {
	var saveBtn = document.getElementById("save");
	var cancelBtn = document.getElementById("cancel");
	if (!saveBtn.hasAttribute("disabled"))
		saveBtn.setAttribute("disabled", "");
	if (!cancelBtn.hasAttribute("disabled"))
		cancelBtn.setAttribute("disabled", "");
}

/**
 * Event listener that saves data back to the browser storage data
 */
function saveData(ev) {
	var name = document.getElementById("name");
	var container = document.getElementById("container");
	var index = sessionIndex;
	var tabs = [];
	var msgDiv = document.getElementById("msg");
	var inputs;

	if (name.value == "") {
		showMessage(msgDiv, "Name is empty", "red", 10);
		return;
	} else if (name.value != name.defaultValue){
		let flag = sessions.find((s) => {
			return s.name == name;
		});
		if (flag) {
			showMessage(msgDiv,
				"A session named " + name + " already exists",
				"red",
				10);
			return;
		}
	}

	for (let c of container.children) {
		let obj = getSingleTab(c);
		if (obj.error == NOERR) {
			tabs.push(obj.tab);
		} else {
			let msg = "";
			if (obj.error != INVURL) {
				msg = "One or more fields are empty";
			} else {
				msg = "The url schema is not acceptable."
			}
			showMessage(msgDiv, msg, "red", 10);
			showBorder(c, "red", 4, 10);
			return;
		}
	}

	sessions[index].tabs = tabs;
	sessions[index].name = name.value;
	browser.storage.local.set({sessions : sessions}).catch(onError);
	// the following change the default value to prevent the cancel button
	// to restore the original value. Now we use the saved one
	inputs = document.getElementsByTagName("input");
	for (let i of inputs) {
		if (i.type == "text")
			i.defaultValue = i.value;
	}
	// change the original-index to the current for the same reason of the
	// above loop
	tabs = document.getElementsByClassName("tab");
	for (let t of tabs) {
		if (t.hasAttribute("new"))
			t.removeAttribute("new");
		t.setAttribute("original-index", t.getAttribute("index"));
	}

	trash = [];
	unsaved = false;
	disableButtons();
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
	sessionIndex = sessions.findIndex((e) => {
		return e.name == sessionName;
	});
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
	var nameInput = document.getElementsByName("name")[0];
	var container = document.getElementById("container")
	var s = sessions[sessionIndex];
	nameInput.defaultValue = sessionName;

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
	var cancelBtn = document.getElementById("cancel");
	var newBtn = document.getElementById("new");
	var name = document.getElementById("name");
	var params = new URLSearchParams(document.location.search.substring(1));
	sessionName = params.get("session");
	if (sessionName == null || sessionName == "") {
		var msgDiv = document.getElementById("msg");
		showMessage(msgDiv,
			"No session specified!\nPlease close this page",
			"red",
			365 * 3600);
		return;
	}
	/*
	 * Load the already saved session (if any)
	 */
	browser.storage.local.get("sessions")
		.then(onGot)
		.then(onShow)
		.catch(onError);
	saveBtn.addEventListener("click", saveData);
	cancelBtn.addEventListener("click", resetPage);
	newBtn.addEventListener("click", newListener);
	name.addEventListener("input", changeListener);
});

window.onbeforeunload = function(e) {
	var dialogText = "There's unsaved changes. Do you want to quit?";
	if (!unsaved) {
		return undefined;
	}

	e.returnValue = dialogText;
	return dialogText;
};
