/* 
  The contents of this file are subject to the Netscape Public
  License Version 1.1 (the "License"); you may not use this file
  except in compliance with the License. You may obtain a copy of
  the License at http://www.mozilla.org/NPL/
  
  Software distributed under the License is distributed on an "AS
  IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
  implied. See the License for the specific language governing
  rights and limitations under the License.
  
  The Original Code is Mozilla Communicator client code, released
  March 31, 1998.
  
  The Initial Developer of the Original Code is David Hyatt. 
  Portions created by David Hyatt are
  Copyright (C) 2002 David Hyatt. All
  Rights Reserved.
  
  Contributor(s): 
    David Hyatt (hyatt@apple.com)

*/

var gCurrentDragOverItem = null;

function buildDialog()
{
  var toolbar = window.opener.document.getElementById("nav-bar");
  var cloneToolbarBox = document.getElementById("cloned-bar-container");

  var paletteBox = document.getElementById("palette-box");

  var newToolbar = toolbar.cloneNode(true);
  cloneToolbarBox.appendChild(newToolbar);

  // Make sure all buttons look enabled (and that textboxes are disabled).
  var toolbarItem = newToolbar.firstChild;
  while (toolbarItem) {
    toolbarItem.removeAttribute("observes");
    toolbarItem.removeAttribute("disabled");
    toolbarItem.removeAttribute("type");

    if (toolbarItem.localName == "toolbaritem" && 
        toolbarItem.firstChild) {
      toolbarItem.firstChild.removeAttribute("observes");
      if (toolbarItem.firstChild.localName == "textbox")
        toolbarItem.firstChild.setAttribute("disabled", "true");
      else
        toolbarItem.firstChild.removeAttribute("disabled");
    }

    toolbarItem = toolbarItem.nextSibling;
  }

  
  // Now build up a palette of items.
  var currentRow = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
                                            "hbox");
  currentRow.setAttribute("class", "paletteRow");

  var rowSlot = 0;
  var rowMax = 4;

  var node = toolbar.palette.firstChild;
  while (node) {
    var paletteItem = node.cloneNode(true);
    paletteItem.removeAttribute("observes");
    paletteItem.removeAttribute("disabled");
    paletteItem.removeAttribute("type");

    if (paletteItem.localName == "toolbaritem" && 
        paletteItem.firstChild) {
      paletteItem.firstChild.removeAttribute("observes");
      if (paletteItem.firstChild.localName == "textbox")
        paletteItem.firstChild.setAttribute("disabled", "true");
      else
        paletteItem.firstChild.removeAttribute("disabled");
    }

    if (rowSlot == rowMax) {
      // Append the old row.
      paletteBox.appendChild(currentRow);

      // Make a new row.
      currentRow = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
                                            "hbox");
      currentRow.setAttribute("class", "paletteRow");
      rowSlot = 0;
    } 

    rowSlot++;
    // Create an enclosure for the item.
    var enclosure = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
                                            "toolbarpaletteitem");
    enclosure.setAttribute("align", "center");
    enclosure.setAttribute("pack", "center");
    enclosure.setAttribute("flex", "1");
    enclosure.setAttribute("width", "0");
    enclosure.setAttribute("minheight", "0");
    enclosure.setAttribute("minwidth", "0");
    enclosure.setAttribute("ondraggesture", "nsDragAndDrop.startDrag(event, dragObserver)");
 
    enclosure.appendChild(paletteItem);
    currentRow.appendChild(enclosure);

    node = node.nextSibling;
  }

  if (currentRow) { 
    // Remaining flex
    var remainingFlex = rowMax - rowSlot;
    if (remainingFlex > 0) {
      var spring = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
                                            "spacer");
      spring.setAttribute("flex", remainingFlex);
      currentRow.appendChild(spring);
    }

    paletteBox.appendChild(currentRow);
  }

}

var dragObserver = {
  onDragStart: function (aEvent, aXferData, aDragAction) {
    aXferData.data = new TransferDataSet();
    var data = new TransferData();
    data.addDataForFlavour("text/unicode", aEvent.target.firstChild.id);
    aXferData.data.push(data);
  }
}

var dropObserver = {
  onDragOver: function (aEvent, aFlavour, aDragSession)
  {
    if (gCurrentDragOverItem)
      gCurrentDragOverItem.removeAttribute("dragactive");

    var dropTargetWidth = aEvent.target.boxObject.width;
    var dropTargetX = aEvent.target.boxObject.x;
    if (aEvent.clientX > (dropTargetX + (dropTargetWidth / 2)))
      gCurrentDragOverItem = aEvent.target.nextSibling;
    else
      gCurrentDragOverItem = aEvent.target;

    gCurrentDragOverItem.setAttribute("dragactive", "true");
    aDragSession.canDrop = true;
  },
  onDrop: function (aEvent, aXferData, aDragSession)
  {
    var newButtonId = transferUtils.retrieveURLFromData(aXferData.data, aXferData.flavour.contentType);
    var palette = window.opener.document.getElementById("nav-bar").palette;
    var paletteItem = palette.firstChild;
    while (paletteItem) {
      if (paletteItem.id == newButtonId)
        break;
      paletteItem = paletteItem.nextSibling;
    }
    if (!paletteItem)
      return;

    paletteItem = paletteItem.cloneNode(paletteItem);
    var toolbar = document.getElementById("nav-bar");
    toolbar.insertBefore(paletteItem, gCurrentDragOverItem);
    gCurrentDragOverItem = null;
  },
  _flavourSet: null,
  getSupportedFlavours: function ()
  {
    if (!this._flavourSet) {
      this._flavourSet = new FlavourSet();
      this._flavourSet.appendFlavour("text/unicode");
    }
    return this._flavourSet;
  }
}

