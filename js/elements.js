
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
