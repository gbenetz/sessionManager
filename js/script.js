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
 * Creates an img element containing the specified arrow image
 *
 * type is the type of the arrow ("down" or "right")
 * Returns:
 * the newly created element
 */
function createArrow(type) {
	var arrow = document.createElement("img");
	arrow.setAttribute("src", "../images/arrow_" + type + ".svg");
	arrow.setAttribute("width", "12px");
	arrow.setAttribute("height", "12px");
	arrow.setAttribute("src", "../images/arrow_" + type + ".svg");
	arrow.className = "arrow-" + type;

	if (type == "down") {
		arrow.style.display = "none";
	}

	return arrow;
}

/**
 * It creates the row for the session
 *
 * name is the name of the session
 * Returns:
 * the row
 */
function createSessionRow(name) {
	var row, arrows, text;
	row = document.createElement("div");
	row.className = "row";
	arrows = document.createElement("div");
	arrows.className = "arrows-icon";
	arrows.appendChild(createArrow("right"))
	arrows.appendChild(createArrow("down"))
	row.appendChild(arrows);
	text = document.createElement("div");
	text.className = "text";
	text.setAttribute("style", "margin-left: 10px");
	text.appendChild(document.createTextNode(name));
	row.appendChild(text);
	row.appendChild(createSessionCmds(name));
	return row;
}
