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
		filename: "sessions.json"
	};
	var downloading = browser.downloads.download(obj);
	downloading.then((id) => {
		console.log(`Download started ${id}`);
	})
	.catch(onError);
}

/*
 * Add an eventListener for the load event in order to setup things and show all
 * the already saved session
 */
window.addEventListener("load", (e) => {
	var exportBtn = document.getElementById("export-cmd");
	exportBtn.addEventListener("click", exportData);
	/*
	 * Load the already saved session (if any)
	 */
	browser.storage.local.get("sessions")
		.then(onGot)
		.catch(onError)
});

