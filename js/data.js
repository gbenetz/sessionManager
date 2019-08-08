var sessions = [];

/**
 * Retrieves data from the storage.local.get Promise.
 *
 * data the data retrieved
 */
function onGot(data) {
	console.log(data);
	if (data.hasOwnProperty("sessions")) {
		sessions = data.sessions;
	} else {
		throw new Error("Sessions object not found")
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

