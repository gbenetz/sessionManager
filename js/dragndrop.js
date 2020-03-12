/*
	function findDropped(dropped) -> realDropped
	function preDrop(indexDrag, indexDrop)
	function getChild(div) -> child
	function postDrop(indexDrag, indexDrop)

	per script:
	
	var divs = document.getElementsByClassName("container");
	var container = document.getElementById("sessions-container");
	findDropped è:
	while (dropped.className != "container")
		dropped = dropped.parentElement;
	
	preDrop è:
	var session = sessions[indexDrag];
	sessions.splice(indexDrag, 1);
	sessions.splice(indexDrop, 0, session);
	sessions.forEach((el, index) => {
		el.index = index;
	});
	console.log(sessions);

	getChild è:
	child = div.firstChild

	length = sessions.length - 1

	postDrop è:
	browser.storage.local.set({sessions : sessions}).catch(onError);
	
	per edit:

	var divs = document.getElementsByClassName("tab");
	var container = document.getElementById("container");
	findDropped è:
	while (!dropped.className.includes("tab"))
		dropped = dropped.parentElement;
	
	preDrop è vuota

	getChild è:
	child = div

	length = ???

	postDrop è:
	unsaved = true;
	enableButtons();
*/

/**
 * Event handler that allows the drop of an object on the target
 */
function allowDrop(ev) {
	ev.preventDefault();
}

/**
 * Event handler that manages the daragging of a session row
 */
function drag(ev) {
	ev.dataTransfer.setData("index", ev.target.getAttribute("index"));
}

/**
 * Helper function to handle the idexes exchange
 *
 * Parameters:
 * div		the current element
 * dropped	the dropped element
 * index	the current index
 * indexDrag	index of the dragged element 
 * indexDrag	index of the element where the drop occurs
 *
 * Return:
 * the updated dropped element
 */
function handleIndex(div, dropped, index, indexDrag, indexDrop) {
	if (indexDrop > indexDrag) {
		if (index == indexDrop + 1) {
			return div;
		} else if (index > indexDrag &&
			   index <= indexDrop) {
			div.setAttribute("index", index - 1);
			return dropped;
		} else
			return dropped;
	} else {
		if (index >= indexDrop && index < indexDrag) {
			div.setAttribute("index", index + 1);
			return dropped;
		} else
			return dropped;
	}
}

/**
 * Event handler that manages the dropping of a session row on another.
 * It manages also the indexes.
 *
 * ev		the drop event
 * container	the element that contains the draggable items
 * funcs	object that contains the following functions:
 * 	findDropped(dropped) -> realDropped	finds the correct dropped
 * 						element given the ev.target
 * 	getChild(div) -> child			gets the div child that must be
 * 						updated
 * 	getDivs() -> divs			returns an array-like of the
 * 						draggable items
 * 	preDrop(indexDrag, indexDrop)		performs preliminary tasks
 * 						before the drop is actually done
 * 	postDrop(indexDrag, indexDrop)		performs tasks after the drop
 * 	getLength()				gets the length of the drag and
 * 						drop area
 */
function drop(ev, container, funcs) {
	ev.preventDefault();
	var indexDrag = Number.parseInt(ev.dataTransfer.getData("index"), 10);
	var indexDrop, dropped = ev.target;
	var dragged;
	var child, cls, newIndex;
	var divs = funcs.getDivs();

	dropped = funcs.findDropped(dropped)

	indexDrop = Number.parseInt(dropped.getAttribute("index"), 10);
	if (indexDrag == indexDrop)
		return;

	funcs.preDrop(indexDrag, indexDrop);

	for (let div of divs) {
		var index = Number.parseInt(div.getAttribute("index"), 10);
		if (index == indexDrag) {
			dragged = div;
			div.setAttribute("index", indexDrop);
		} else {
			dropped = handleIndex(div, dropped, index,
						indexDrag, indexDrop);
		}

		child = funcs.getChild(div)
		cls = child.className;
		newIndex = Number.parseInt(div.getAttribute("index"), 10);
		if ((newIndex & 1) == 0)
			child.className = cls.replace("odd", "even");
		else
			child.className = cls.replace("even", "odd");
	}

	if (indexDrop == funcs.getLength() - 1)
		container.appendChild(dragged);
	else
		container.insertBefore(dragged, dropped);

	funcs.postDrop(indexDrag, indexDrop);
}

