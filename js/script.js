var sessions = [];
/**
 * Creates a button
 *
 * type is a label that is applied to the class name
 * cmd is the type of command. This two parameters are used to create the class
 * of the new button in the form of 'type'-cmd 'cmd'-btn
 * content is an HTMLElement to be used as the "label" of the button
 * Returns:
 * the newly created button
 */
function createButton(type, cmd, content) {
	var btn = document.createElement("button");
	btn.className = type + "-cmd " + cmd + "-btn";
	btn.appendChild(content);
	return btn;

}

/**
 * Create an img with the specified icon and size
 *
 * type		is the name of the icon. Must be one of the svg files in the
 * 		images dir.
 * 		type must be the name without the .svg suffix.
 * width	width of the icon. Must be a string suitable for the width
 * 		attribute.
 * height	height of the icon. Must be a string suitable for the height
 * 		attribute.
 */
function createIcon(type, width, height) {
	var icon = document.createElement("img")
	icon.setAttribute("src", "../images/" + type + ".svg");
	icon.setAttribute("width", width);
	icon.setAttribute("height", height);
	return icon;
}

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
			   createIcon("start", "24px", "24px"));
	btn.addEventListener("click", startSession);
	cmds.appendChild(btn);
	btn = createButton("session",
			   "edit",
			   createIcon("edit", "24px", "24px"));
	cmds.appendChild(btn);
	btn = createButton("session",
			   "delete",
			   createIcon("delete", "24px", "24px"));
	cmds.appendChild(btn);
	btn = createButton("session",
			   "up",
			   createIcon("up", "24px", "24px"));
	cmds.appendChild(btn);
	btn = createButton("session",
			   "down",
			   createIcon("down", "24px", "24px"));
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
	empty = document.createElement("div");
	empty.className = "empty";
	row.appendChild(empty);
	text = document.createElement("div");
	text.className = "text";
	text.appendChild(document.createTextNode(name));
	row.appendChild(text);
	row.appendChild(createSessionCmds(name));
	return row;
}

/**
 * Adds a row containing a session
 *
 * name is the name of the session
 */
function addSessionToPopup(name) {
	var container = document.getElementById("sessions-container");
	var newDiv = document.createElement("div");
	var containers = document.getElementsByClassName("container");
	var odd = (containers.length & 1) == 1;
	newDiv.className = "container";
	newDiv.setAttribute("session", name);
	newDiv.appendChild(createSessionRow(name, odd));
	container.appendChild(newDiv);
}

/**
 * Shows a message in the message pane
 *
 * message is the text to show
 * timeout is the number of seconds the message has to be shown
 */
function showMessage(message, timeout) {
	var msg = document.getElementsByClassName("message")[0];
	var text;
	text = document.createTextNode(message);
	msg.appendChild(text);
	msg.style.color = "red";
	window.setTimeout(() => {
		while (msg.firstChild) {
			msg.removeChild(msg.firstChild);
		}
	}, timeout * 1000);
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
 */
function checkAndStoreTabs(tabs, name) {
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
		showMessage("All tabs are privileged ones: session not saved", 10);
		return;
	}

	if (filteredTabs.length != tabs.length) {
		showMessage("Some tabs omitted because their urls are privileged ones", 10);
	}
	session.tabs = filteredTabs.map((tab, index) => {
		return {title: tab.title, url: tab.url, index: index};
	});
	sessions.push(session);
	browser.storage.local.set({sessions : sessions}).catch(onError);
	addSessionToPopup(name);
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
		showMessage("The name is required", 10);
		return;
	}
	nameTextBox.value = "";
	/*
	 * TODO: implement overwrite 
	 */
	if (sessions.some(e => e.name == name)) {
		showMessage(`Session ${name} already exists`, 10);
		return;
	}
	var tabs = browser.tabs.query({currentWindow: true});
	tabs.then(tabs => checkAndStoreTabs(tabs, name)).catch(onError);
}

/**
 * Starts a saved session
 *
 * ev is the event that triggered the session start
 */
function startSession(ev) {
	var creating;
	var name = ev.target.parentNode.getAttribute("session");
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
 * Print the error on the console
 *
 * error the error occurred
 */
function onError(error) {
	console.log(`Error: ${error}`);
}

/**
 * Retrieved data from the storage.local.get Promise.
 * It sets up all the things to show the sessions
 *
 * data the data retrieved
 */
function onGot(data) {
	console.log(data);
	if (data.hasOwnProperty("sessions")) {
		sessions = data.sessions;
		for (let session of sessions) {
			addSessionToPopup(session.name);
		}
	}
}

/*
 * Add an eventListener for the load event in order to setup things and show all
 * the already saved session
 */
window.addEventListener("load", (e) => {
	/*
	 * Add the eventListener to the save button
	 */
	var saveBtn = document.getElementById("session-save");
	saveBtn.addEventListener("click", saveSession);
	/*
	 * Load the already saved session (if any)
	 */
	browser.storage.local.get("sessions").then(onGot).catch(onError);
});

