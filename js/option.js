var sessions = [];

/**
 * Print the error on the console
 *
 * error the error occurred
 */
function onError(error) {
	console.log(`Error: ${error}`);
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
 * Retries data from the storage.local.get Promise.
 *
 * data the data retrieved
 */
function onGot(data) {
	console.log(data);
	if (data.hasOwnProperty("sessions")) {
		sessions = data.sessions;
	}
	if (sessions.length > 0) {
		var exportBtn = document.getElementById("export-cmd");
		exportBtn.removeAttribute("disabled");
	}
}

/**
 * Event handler for the export button
 * It handles all the operation required to export the sessions data as a json
 * file named sessions.json in the download directory
 */
function exportData(ev) {
	var sJson = window.JSON.stringify(sessions);
	var url = window.URL.createObjectURL(new Blob([sJson]));
	var obj = {
		url: url,
		filename: "sessions.json",
		saveAs: true
	};
	var downloading = browser.downloads.download(obj);
	downloading.then((id) => {
		console.log(`Download started ${id}`);
	})
	.catch(onError);
}

/**
 * Checks if the argument has the correct format and the data in it is valid
 *
 * tab the tab object to check
 *
 * Returns:
 * true is tab has the correct format and data. false otherwise.
 */
function checkTab(tab) {
	if (tab.hasOwnProperty("title") &&
		tab.hasOwnProperty("url") &&
		tab.hasOwnProperty("index")) {
		var re = /^https?:\/\//;
		if (re.test(tab.url)) {
			return true;
		}
	}
	return false;
}

/**
 * Chacks if an array of tabs has the correct format and data.
 * Also sort the argument in ascending order of index and then fix the index
 * value.
 *
 * tabs the tab array to check
 *
 * Returns:
 * the fixed array on null if the array has invalid data
 */
function checkTabs(tabs) {
	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i];
		if (!checkTab(tab))
			return null;
	}
	tabs = tabs.sort((a, b) => a.index - b.index);
	for (var i = 0; i < tabs.length; i++) {
		tabs[i].index = i;
	}
	return tabs;
}

/**
 * Checks if a session object has correct format and data
 * It also fixes the tabs array
 *
 * session the object to check
 *
 * Returns
 * the fixed session object or null if the object has invalid data
 */
function checkSession(session) {
	if (session.hasOwnProperty("name") &&
		session.hasOwnProperty("tabs") &&
		session.hasOwnProperty("index")) {
			if (session.tabs instanceof Array) {
				var tabs = checkTabs(session.tabs);
				if (tabs != null) {
					session.tabs = tabs;
					return session;
				}
			}
	}
	return null;
}

/**
 * Checks if a session array has correct format and data
 * It also fixes the tabs array of all the elements
 *
 * sessions the array to check
 *
 * Returns
 * the fixed session array or null if the array has invalid data
 */
function checkSessions(sessionArray) {
	for (var i = 0; i < sessionArray.length; i++) {
		var session = checkSession(sessionArray[i]);
		if (session == null)
			return null;
		sessionArray[i] = session;
	}
	sessionArray = sessionArray.sort((a, b) => a.index - b.index);
	for (var i = 0; i < sessionArray.length; i++) {
		sessionArray[i].index = i;
	}
	return sessionArray;
}

/**
 * Event handler used to get data when the file read operation is ended. 
 */
function onFileLoad(ev) {
	console.log(ev.target.result);
	var imported;
	try {
		imported = JSON.parse(ev.target.result);
		imported = checkSessions(imported);
		if (imported == null) {
			throw TypeError("The imported object has an incorrect format");
		}
		sessions = imported;
		browser.storage.local.set({sessions : sessions}).catch(onError);
			
	} catch (e) {
		onError(e);
	}
}

/**
 * Event handler used to manage the selection of a file.
 */
function onChange(ev) {
	var fileCh = ev.target;
	console.log(fileCh.files[0]);
	var reader = new FileReader();
	reader.onload = onFileLoad;
	reader.readAsText(fileCh.files[0]);
	fileCh.value = "";
}

/*
 * Add an eventListener for the load event in order to setup things
 */
window.addEventListener("load", (e) => {
	var exportBtn = document.getElementById("export-cmd");
	exportBtn.addEventListener("click", exportData);
	var importBtn = document.getElementById("import-cmd");
	importBtn.addEventListener("change", onChange);
	/*
	 * Load the already saved session (if any)
	 */
	browser.storage.local.get("sessions")
		.then(onGot)
		.catch(onError)
});

