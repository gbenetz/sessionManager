
/**
 * Creates a button
 *
 * type is a label that is applied to the class name
 * cmd is the type of command. This two parameters are used to create the class
 * of the new button in the form of 'type'-cmd 'cmd'-btn
 * content is an HTMLElement to be used as the "label" of the button
 * tooltip is the button tooltip text
 * Returns:
 * the newly created button
 */
function createButton(type, cmd, content, tooltip) {
	var btn = document.createElement("button");
	btn.className = type + "-cmd " + cmd + "-btn";
	btn.appendChild(content);
	btn.title = tooltip;
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
 * draggable	value of the draggable property. Default true
 */
function createIcon(type, width, height, draggable = true) {
	var icon = document.createElement("img")
	icon.setAttribute("src", "../images/" + type + ".svg");
	icon.setAttribute("width", width);
	icon.setAttribute("height", height);
	icon.className = "icon";
	icon.setAttribute("draggable", draggable);
	return icon;
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

