/**
 * Creates a button
 *
 * type is a label that is applied to the class name
 * cmd is the type of command. This two parameters are used to create the class
 * of the new button in the form of 'type'-cmd-'cmd'
 * content is an HTMLElement to be used as the "label" of the button
 * Returns:
 * the newly created button
 */
function createButton(type, cmd, content) {
	var btn = document.createElement("button");
	btn.className = type + "-cmd-" + cmd;
	btn.appendChild(content);
	return btn;

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
			   document.createTextNode("Avvia"));
	cmds.appendChild(btn);
	btn = createButton("session",
			   "edit",
			   document.createTextNode("Modifica"));
	cmds.appendChild(btn);
	btn = createButton("session",
			   "delete",
			   document.createTextNode("Elimina"));
	cmds.appendChild(btn);
	return cmds;
}

/**
 * It creates the row for the session
 *
 * name is the name of the session
 * Returns:
 * the row
 */
function createSessionRow(name) {
	var row, empty, text;
	row = document.createElement("div");
	row.className = "session-row row";
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
	newDiv.className = "container";
	newDiv.setAttribute("session", name);
	newDiv.appendChild(createSessionRow(name));
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
 * Print the error on the console
 *
 * error the error occurred
 */
function onError(error) {
	console.log(`Error: ${error}`);
}
