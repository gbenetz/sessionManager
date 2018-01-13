/**
 * Creates an img element containing the specified arrow image
 *
 * type is the type of the arrow ("down" or "right")
 * session is the session name
 * Returns:
 * the newly created element
 */
function createArrow(type, session) {
	var arrow = document.createElement("img");
	arrow.setAttribute("src", "../images/arrow_" + type + ".svg");
	arrow.setAttribute("width", "12px");
	arrow.setAttribute("height", "12px");
	arrow.setAttribute("src", "../images/arrow_" + type + ".svg");
	arrow.setAttribute("session", session);
	arrow.className = "arrow-" + type;

	if (type == "down") {
		arrow.style.display = "none";
	}

	return arrow;
}
/**
 * Creates the div that contains all the tab commands
 *
 * url is the tab url
 * Returns:
 * the newly created div
 */
function createTabCmds(url) {
	var cmds = document.createElement("div");
	cmds.className = "commands"
	cmds.setAttribute("tab-url", url);
	cmds.appendChild(createButton("tab",
					"start",
					document.createTextNode("Avvia")));
	cmds.appendChild(createButton("tab",
					"edit",
					document.createTextNode("Modifica")));
	cmds.appendChild(createButton("tab",
					"delete",
					document.createTextNode("Elimina")));
	return cmds;
}

function createTabRow(tab) {
	var row, tabdiv, cmds;
	row = document.createElement("div");
	row.className = "inner-row";
	tabdiv = document.createElement("div");
	tabdiv.className = "text";
	tabdiv.appendChild(document.createTextNode(tab.title));
	row.appendChild(tabdiv);
	cmds = createTabCmds(tab.url);
	row.appendChild(cmds);
	return row;

}

function createTabsRows(name, tabs) {
	var rows;
	rows = document.createElement("div");
	rows.className = "row tabs-row";
	rows.setAttribute("session", name);
	rows.style.display = "none";
	for (let tab of tabs) {
		rows.appendChild(createTabRow(tab));
	}
	return rows;
}

document.addEventListener("click", (e) => {
	if (e.target.className.includes("arrow")) {
		var arrows, arrow, session, other, otherClass, rows, rowStyle;
		arrow = e.target;
		session = arrow.getAttribute("session");
		if (arrow.className == "arrow-right") { // show content
			otherClass = "arrow-down";
			rowStyle = "";
		} else { // hide content
			otherClass = "arrow-right";
			rowStyle = "none";
		}
		arrows = document.getElementsByClassName(otherClass);
		for (let a of arrows) {
			if (a.getAttribute("session") == session)
				other = a;
		}
		arrow.style.display = "none";
		other.style.display = "";
		rows = document.getElementsByClassName("tabs-row");
		for(let row of rows) {
			if (row.getAttribute("session") == session) {
				row.style.display = rowStyle;
				break;
			}
		}
	}
});
