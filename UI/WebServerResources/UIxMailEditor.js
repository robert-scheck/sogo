/* -*- Mode: java; indent-tabs-mode: nil; c-basic-offset: 4 -*- */

var contactSelectorAction = 'mailer-contacts';
var attachmentCount = 0;
var MailEditor = {
    addressBook: null,
    currentField: null,
    selectedIndex: -1,
    delay: 750,
    delayedSearch: false,
    signatureLength: 0,
    textFirstFocus: true
};

function onContactAdd() {
    var selector = null;
    var selectorURL = '?popup=YES&selectorId=mailer-contacts';
 
    if (MailEditor.addressBook && MailEditor.addressBook.open && !MailEditor.addressBook.closed)
        MailEditor.addressBook.focus();
    else {
        var urlstr = ApplicationBaseURL 
            + "../Contacts/"
            + contactSelectorAction + selectorURL;
        MailEditor.addressBook = window.open(urlstr, "_blank",
                                             "width=640,height=400,resizable=1,scrollbars=0");
        MailEditor.addressBook.selector = selector;
        MailEditor.addressBook.opener = self;
        MailEditor.addressBook.focus();
    }
  
    return false;
}

function addContact(tag, fullContactName, contactId, contactName, contactEmail) {
    if (!mailIsRecipient(contactEmail)) {
        var neededOptionValue = 0;
        if (tag == "cc")
            neededOptionValue = 1;
        else if (tag == "bcc")
            neededOptionValue = 2;

        var stop = false;
        var counter = 0;
        var currentRow = $('row_' + counter);
        while (currentRow && !stop) {
            var currentValue = $(currentRow.childNodesWithTag("td")[1]).childNodesWithTag("input")[0].value;
            if (currentValue == neededOptionValue) {
                stop = true;
                insertContact($("addr_" + counter), contactName, contactEmail);
            }
            counter++;
            currentRow = $('row_' + counter);
        }

        if (!stop) {
            fancyAddRow(false, "");
            var row = $("row_" + currentIndex);
            var td = $(row.childNodesWithTag("td")[0]);
            var select = $(td.childNodesWithTag("select")[0]);
            select.value = neededOptionValue;
            insertContact($("addr_" + currentIndex), contactName, contactEmail);
            onWindowResize(null);
        }
    }
}

function mailIsRecipient(mailto) {
    var isRecipient = false;

    var counter = 0;
    var currentRow = $('row_' + counter);

    var email = extractEmailAddress(mailto).toUpperCase();

    while (currentRow && !isRecipient) {
        var currentValue = $("addr_"+counter).value.toUpperCase();
        if (currentValue.indexOf(email) > -1)
            isRecipient = true;
        else
            {
                counter++;
                currentRow = $('row_' + counter);
            }
    }

    return isRecipient;
}

function insertContact(inputNode, contactName, contactEmail) {
    var value = '' + inputNode.value;

    var newContact = contactName;
    if (newContact.length > 0)
        newContact += ' <' + contactEmail + '>';
    else
        newContact = contactEmail;

    if (value.length > 0)
        value += ", ";
    value += newContact;

    inputNode.value = value;
}


/* mail editor */

function validateEditorInput(sender) {
    var errortext = "";
    var field;
   
    field = document.pageform.subject;
    if (field.value == "")
        errortext = errortext + labels["error_missingsubject"] + "\n";

    if (!hasRecipients())
        errortext = errortext + labels["error_missingrecipients"] + "\n";
   
    if (errortext.length > 0) {
        alert(labels["error_validationfailed"] + ":\n" + errortext);
        return false;
    }

    return true;
}

function clickedEditorSend(sender) {
    if (!validateEditorInput(sender))
        return false;

    var input = currentAttachmentInput();
    if (input)
        input.parentNode.removeChild(input);

    var toolbar = document.getElementById("toolbar");
    if (!document.busyAnim)
        document.busyAnim = startAnimation(toolbar);
  
    var lastRow = $("lastRow");
    lastRow.down("select").name = "popup_last";
  
    window.shouldPreserve = true;
    document.pageform.action = "send";
    document.pageform.submit();
  
    return false;
}

function currentAttachmentInput() {
    var input = null;

    var inputs = $("attachmentsArea").getElementsByTagName("input");
    var i = 0;
    while (!input && i < inputs.length)
        if ($(inputs[i]).hasClassName("currentAttachment"))
            input = inputs[i];
        else
            i++;

    return input;
}

function clickedEditorAttach(sender) {
    var input = currentAttachmentInput();
    if (!input) {
        var area = $("attachmentsArea");

        if (!area.style.display) {
            area.setStyle({ display: "block" });
            onWindowResize(null);
        }
        var inputs = area.getElementsByTagName("input");
        var attachmentName = "attachment" + attachmentCount;
        var newAttachment = createElement("input", attachmentName,
                                          "currentAttachment", null,
                                          { type: "file",
                                            name: attachmentName },
                                          area);
        attachmentCount++;
        newAttachment.observe("change",
                              onAttachmentChange.bindAsEventListener(newAttachment));
    }

    return false;
}

function onAttachmentChange(event) {
    if (this.value == "")
        this.parentNode.removeChild(this);
    else {
        this.addClassName("attachment");
        this.removeClassName("currentAttachment");
        var list = $("attachments");
        createAttachment(this, list);
        clickedEditorAttach(null);
    }
}

function createAttachment(node, list) {
    var attachment = createElement("li", null, null, { node: node }, null, list);
    createElement("img", null, null, { src: ResourcesURL + "/attachment.gif" },
                  null, attachment);
    attachment.observe("click", onRowClick);

    var filename = node.value;
    var separator;
    if (navigator.appVersion.indexOf("Windows") > -1)
        separator = "\\";
    else
        separator = "/";
    var fileArray = filename.split(separator);
    var attachmentName = document.createTextNode(fileArray[fileArray.length-1]);
    attachment.appendChild(attachmentName);
}

function clickedEditorSave(sender) {
    var input = currentAttachmentInput();
    if (input)
        input.parentNode.removeChild(input);

    var lastRow = $("lastRow");
    lastRow.down("select").name = "popup_last";

    window.shouldPreserve = true;
    document.pageform.action = "save";
    document.pageform.submit();

    if (window.opener && window.opener.open && !window.opener.closed)
        window.opener.refreshFolderByType('draft');
    return false;
}

function onTextFocus(event) {
    if (MailEditor.textFirstFocus) {
        // On first focus, position the caret at the proper position
        var content = this.getValue();
        var replyPlacement = UserDefaults["ReplyPlacement"];
        if (replyPlacement == "above" || !mailIsReply) { // for forwards, place caret at top unconditionally
            this.setCaretTo(0);
        }
        else {
            var caretPosition = this.getValue().length - MailEditor.signatureLength;
            if (Prototype.Browser.IE)
                caretPosition -= lineBreakCount(this.getValue().substring(0, caretPosition));
            if (hasSignature())
                caretPosition -= 2;
            this.setCaretTo(caretPosition);
        }
        MailEditor.textFirstFocus = false;
    }
	
    var input = currentAttachmentInput();
    if (input)
        input.parentNode.removeChild(input);
}

function onTextKeyDown(event) {
    if (event.keyCode == Event.KEY_TAB) {
        // Change behavior of tab key in textarea
        if (event.shiftKey) {
            var subjectField = $$("div#subjectRow input").first();
            subjectField.focus();
            subjectField.selectText(0, subjectField.value.length);
            preventDefault(event);
        }
        else {
            if (!(event.shiftKey || event.metaKey || event.ctrlKey)) {
                if (typeof(this.selectionStart)
                    != "undefined") { // For Mozilla and Safari
                    var cursor = this.selectionStart;
                    var startText = ((cursor > 0)
                                     ? this.value.substr(0, cursor)
                                     : "");
                    var endText = this.value.substr(cursor);
                    var newText = startText + "   " + endText;
                    this.value = newText;
                    cursor += 3;
                    this.setSelectionRange(cursor, cursor);
                }
                else if (this.selectionRange) // IE
                    this.selectionRange.text = "   ";
                else { // others ?
                }
                preventDefault(event);
            }
        }
    }
}

function onTextIEUpdateCursorPos(event) {
    this.selectionRange = document.selection.createRange().duplicate();
}

function onTextMouseDown(event) {
    if (event.button == 0) {
        event.returnValue = false;
        event.cancelBubble = false;
    }
}

/* address completion */

function onContactKeydown(event) {
    if (event.ctrlKey || event.metaKey) {
        this.focussed = true;
        return;
    }
    if (event.keyCode == Event.KEY_TAB) {
        if (this.confirmedValue)
            this.value = this.confirmedValue;
        if (document.currentPopupMenu)
            hideMenu(document.currentPopupMenu);
    }
    else if (event.keyCode == 0
             || event.keyCode == Event.KEY_BACKSPACE
             || event.keyCode == 32  // Space
             || event.keyCode > 47) {
        this.confirmedValue = null;
        MailEditor.selectedIndex = -1;
        MailEditor.currentField = this;
        if (MailEditor.delayedSearch)
            window.clearTimeout(MailEditor.delayedSearch);
        MailEditor.delayedSearch = window.setTimeout("performSearch()", MailEditor.delay);
    }
    else if (event.keyCode == Event.KEY_RETURN) {
        preventDefault(event);
        if (this.confirmedValue)
            this.value = this.confirmedValue;
        $(this).select();
        if (document.currentPopupMenu)
            hideMenu(document.currentPopupMenu);
        MailEditor.selectedIndex = -1;
    }
    else if ($('contactsMenu').getStyle('visibility') == 'visible') {
        if (event.keyCode == Event.KEY_UP) { // Up arrow
            if (MailEditor.selectedIndex > 0) {
                var contacts = $('contactsMenu').select("li");
                contacts[MailEditor.selectedIndex--].removeClassName("selected");
                this.value = contacts[MailEditor.selectedIndex].readAttribute("address");
                contacts[MailEditor.selectedIndex].addClassName("selected");
            }
        }
        else if (event.keyCode == Event.KEY_DOWN) { // Down arrow
            var contacts = $('contactsMenu').select("li");
            if (contacts.size() - 1 > MailEditor.selectedIndex) {
                if (MailEditor.selectedIndex >= 0)
                    contacts[MailEditor.selectedIndex].removeClassName("selected");
                MailEditor.selectedIndex++;
                this.value = contacts[MailEditor.selectedIndex].readAttribute("address");
                contacts[MailEditor.selectedIndex].addClassName("selected");
            }
        }
    }
}

function onContactBlur(event) {
    if (MailEditor.delayedSearch)
        window.clearTimeout(MailEditor.delayedSearch);
    MailEditor.currentField = null;
}

function performSearch() {
    // Perform address completion
    if (MailEditor.currentField) {
        if (document.contactLookupAjaxRequest) {
            // Abort any pending request
            document.contactLookupAjaxRequest.aborted = true;
            document.contactLookupAjaxRequest.abort();
        }
        if (MailEditor.currentField.value.trim().length > 2) {
            var urlstr = (UserFolderURL + "Contacts/allContactSearch?search="
                          + encodeURIComponent(MailEditor.currentField.value));
            document.contactLookupAjaxRequest =
                triggerAjaxRequest(urlstr, performSearchCallback, MailEditor.currentField);
        }
        else {
            if (document.currentPopupMenu)
                hideMenu(document.currentPopupMenu);
        }
    }
}

function performSearchCallback(http) {
    if (http.readyState == 4) {
        var menu = $('contactsMenu');
        var list = menu.down("ul");
    
        var input = http.callbackData;
    
        if (http.status == 200) {
            var start = input.value.length;
            var data = http.responseText.evalJSON(true);

            if (data.contacts.length > 1) {
                list.select("li").each(function(item) {
                        item.remove();
                    });
	
                // Populate popup menu
                for (var i = 0; i < data.contacts.length; i++) {
                    var contact = data.contacts[i];
                    var completeEmail = contact["c_cn"] + " <" + contact["c_mail"] + ">";
                    var node = new Element('li', { 'address': completeEmail });
                    var matchPosition = completeEmail.toLowerCase().indexOf(data.searchText.toLowerCase());
                    var matchBefore = completeEmail.substring(0, matchPosition);
                    var matchText = completeEmail.substring(matchPosition, matchPosition + data.searchText.length);
                    var matchAfter = completeEmail.substring(matchPosition + data.searchText.length);
                    list.appendChild(node);
                    node.uid = contact["c_name"];
                    node.appendChild(document.createTextNode(matchBefore));
                    node.appendChild(new Element('strong').update(matchText));
                    node.appendChild(document.createTextNode(matchAfter));
                    if (contact["contactInfo"])
                        node.appendChild(document.createTextNode(" (" + contact["contactInfo"] + ")"));
                    $(node).observe("mousedown", onAddressResultClick);
                }

                // Show popup menu
                var offsetScroll = Element.cumulativeScrollOffset(MailEditor.currentField);
                var offset = Element.cumulativeOffset(MailEditor.currentField);
                var top = offset[1] - offsetScroll[1] + node.offsetHeight + 3;
                var height = 'auto';
                var heightDiff = window.height() - offset[1];
                var nodeHeight = node.getHeight();

                if ((data.contacts.length * nodeHeight) > heightDiff)
                    // Limit the size of the popup to the window height, minus 12 pixels
                    height = parseInt(heightDiff/nodeHeight) * nodeHeight - 12 + 'px';

                menu.setStyle({ top: top + "px",
                            left: offset[0] + "px",
                            height: height,
                            visibility: "visible" });
                menu.scrollTop = 0;

                document.currentPopupMenu = menu;
                $(document.body).observe("click", onBodyClickMenuHandler);
            }
            else {
                if (document.currentPopupMenu)
                    hideMenu(document.currentPopupMenu);

                if (data.contacts.length == 1) {
                    // Single result
                    var contact = data.contacts[0];
                    input.uid = contact["c_name"];
                    var completeEmail = contact["c_cn"] + " <" + contact["c_mail"] + ">";
                    if (contact["c_cn"].substring(0, input.value.length).toUpperCase()
                        == input.value.toUpperCase())
                        input.value = completeEmail;
                    else
                        // The result matches email address, not user name
                        input.value += ' >> ' + completeEmail;
                    input.confirmedValue = completeEmail;
	  
                    var end = input.value.length;
                    $(input).selectText(start, end);

                    MailEditor.selectedIndex = -1;
                }
            }
        }
        else
            if (document.currentPopupMenu)
                hideMenu(document.currentPopupMenu);
        document.contactLookupAjaxRequest = null;
    }
}

function onAddressResultClick(event) {
    if (MailEditor.currentField) {
        MailEditor.currentField.uid = this.uid;
        MailEditor.currentField.value = $(this).readAttribute("address");
        MailEditor.currentField.confirmedValue = MailEditor.currentField.value;
    }
}

function initTabIndex(addressList, subjectField, msgArea) {
    var i = 1;
    addressList.select("input.textField").each(function (input) {
            if (!input.readAttribute("readonly")) {
                input.writeAttribute("tabindex", i++);
                input.writeAttribute("autocomplete", "off");
                input.observe("keydown", onContactKeydown); // bind listener for address completion
                input.observe("blur", onContactBlur);
            }
        });
    subjectField.writeAttribute("tabindex", i++);
    msgArea.writeAttribute("tabindex", i);
}

function initMailEditor() {
    var list = $("attachments");
    $(list).attachMenu("attachmentsMenu");
    var elements = $(list).childNodesWithTag("li");
    for (var i = 0; i < elements.length; i++)
        elements[i].observe("click", onRowClick);

    var listContent = $("attachments").childNodesWithTag("li");
    if (listContent.length > 0)
        $("attachmentsArea").setStyle({ display: "block" });

    var textarea = $("text");
  
    var textContent = textarea.getValue();
    if (hasSignature()) {
        var sigLimit = textContent.lastIndexOf("--");
        if (sigLimit > -1)
            MailEditor.signatureLength = (textContent.length - sigLimit);
    }
    if (UserDefaults["ReplyPlacement"] != "above") {
        textarea.scrollTop = textarea.scrollHeight;
    }
    textarea.observe("focus", onTextFocus);
    //textarea.observe("mousedown", onTextMouseDown);
    textarea.observe("keydown", onTextKeyDown);

    if (Prototype.Browser.IE) {
        var ieEvents = [ "click", "select", "keyup" ];
        for (var i = 0; i < ieEvents.length; i++)
            textarea.observe(ieEvents[i], onTextIEUpdateCursorPos, false);
    }

    var subjectField = $$("div#subjectRow input").first();
    initTabIndex($("addressList"), subjectField, textarea);
    //onWindowResize.defer();

    var focusField = (mailIsReply ? textarea : $("addr_0"));
    focusField.focus();

    initializePriorityMenu();

    var composeMode = UserDefaults["ComposeMessagesType"];
    if (composeMode == "html") {
        CKEDITOR.replace('text',
                         {
                             skin: "v2",
                                 toolbar :
                             [['Bold', 'Italic', '-', 'NumberedList', 
                               'BulletedList', '-', 'Link', 'Unlink', 'Image', 
                               'JustifyLeft','JustifyCenter','JustifyRight',
                               'JustifyBlock','Font','FontSize','-','TextColor',
                               'BGColor']
                              ] 
                                 }
                         );
    }

    Event.observe(window, "resize", onWindowResize);
    Event.observe(window, "beforeunload", onMailEditorClose);
    onWindowResize.defer();
}

function initializePriorityMenu() {
    var priority = $("priority").value.toUpperCase();
    var priorityMenu = $("priority-menu").childNodesWithTag("ul")[0];
    var menuEntries = $(priorityMenu).childNodesWithTag("li");
    var chosenNode;
    if (priority == "HIGHEST")
        chosenNode = menuEntries[0];
    else if (priority == "HIGH")
        chosenNode = menuEntries[1];
    else if (priority == "LOW")
        chosenNode = menuEntries[3];
    else if (priority == "LOWEST")
        chosenNode = menuEntries[4];
    else
        chosenNode = menuEntries[2];
    priorityMenu.chosenNode = chosenNode;
    $(chosenNode).addClassName("_chosen");

    var menuItems = $("itemPriorityList").childNodesWithTag("li");
    for (var i = 0; i < menuItems.length; i++)
        menuItems[i].observe("mousedown",
                             onMenuSetPriority.bindAsEventListener(menuItems[i]),
                             false);
}

function getMenus() {
    return { "attachmentsMenu": new Array(null, onRemoveAttachments,
                                          onSelectAllAttachments,
                                          "-",
                                          clickedEditorAttach, null) };
}

function onRemoveAttachments() {
    var list = $("attachments");
    var nodes = list.getSelectedNodes();
    for (var i = nodes.length-1; i > -1; i--) {
        var input = $(nodes[i]).node;
        if (input) {
            input.parentNode.removeChild(input);
            list.removeChild(nodes[i]);
        }
        else {
            var filename = "";
            var childNodes = nodes[i].childNodes;
            for (var j = 0; j < childNodes.length; j++) {
                if (childNodes[j].nodeType == 3)
                    filename += childNodes[j].nodeValue;
            }
            var url = "" + window.location;
            var parts = url.split("/");
            parts[parts.length-1] = "deleteAttachment?filename=" + encodeURIComponent(filename);
            url = parts.join("/");
            triggerAjaxRequest(url, attachmentDeleteCallback,
                               nodes[i]);
        }
    }
}

function attachmentDeleteCallback(http) {
    if (http.readyState == 4) {
        if (isHttpStatus204(http.status)) {
            var node = http.callbackData;
            node.parentNode.removeChild(node);
        }
        else
            log("attachmentDeleteCallback: an error occured: " + http.responseText);
    }
}

function lineBreakCount(str){
    /* counts \n */
    try {
        return((str.match(/[^\n]*\n[^\n]*/gi).length));
    } catch(e) {
        return 0;
    }
}

function hasSignature() {
    try {
        return(UserDefaults.MailAccounts[0].identities[0].signature.length > 0);
    } catch(e) {
        return false;
    }
}

function onMenuSetPriority(event) {
    event.cancelBubble = true;

    var priority = this.getAttribute("priority");
    if (this.parentNode.chosenNode)
        this.parentNode.chosenNode.removeClassName("_chosen");
    this.addClassName("_chosen");
    this.parentNode.chosenNode = this;

    var priorityInput = $("priority");
    priorityInput.value = priority;
}

function onSelectAllAttachments() {
    var list = $("attachments");
    var nodes = list.childNodesWithTag("li");
    for (var i = 0; i < nodes.length; i++)
        nodes[i].selectElement();
}

function onSelectPriority(event) {
    if (event.button == 0 || (isSafari() && event.button == 1)) {
        var node = getTarget(event);
        if (node.tagName != 'BUTTON')
            node = $(node).up("button");
        popupToolbarMenu(node, "priority-menu");
        Event.stop(event);
    }
}

function onWindowResize(event) {
    var textarea = document.pageform.text;
    var rowheight = (Element.getHeight(textarea) / textarea.rows);
    var headerarea = $("headerArea");
  
    var attachmentsarea = $("attachmentsArea");
    var attachmentswidth = 0;
    if (attachmentsarea.style.display) {
        // Resize attachments list
        attachmentswidth = attachmentsarea.getWidth();
        fromfield = $(document).getElementsByClassName('headerField', headerarea)[0];
        var height = headerarea.getHeight() - fromfield.getHeight() - 10;
        if (Prototype.Browser.IE)
            $("attachments").setStyle({ height: (height - 13) + 'px' });
        else
            $("attachments").setStyle({ height: height + 'px' });
    }
    var subjectfield = headerarea.down("div#subjectRow span.headerField");
    var subjectinput = headerarea.down("div#subjectRow input.textField");
  
    // Resize subject field
    subjectinput.setStyle({ width: (window.width()
                                    - $(subjectfield).getWidth()
                                    - attachmentswidth
                                    - 16) + 'px' });

    // Resize address fields
    var addresslist = $('addressList');
    addresslist.setStyle({ width: ($(window).width() - attachmentswidth - 10) + 'px' });

    // Set textarea position
    var hr = headerarea.select("hr").first();
    textarea.setStyle({ 'top': hr.offsetTop + 'px' });

    // Resize the textarea (message content)
    var composeMode = UserDefaults["ComposeMessagesType"];
    if (composeMode == "html") {
        var editor = $('cke_text');
        if (editor == null) {
            onWindowResize.defer();
            return;
        }
        var ck_top = $("cke_top_text");
        var ck_bottom = $("cke_bottom_text");
        var content = $("cke_contents_text");
        var top = hr.offsetTop;
        var height = Math.floor(window.height() - top - ck_top.getHeight() - ck_bottom.getHeight());
        
        if (Prototype.Browser.IE) {
            editor.style.width = '';
            editor.style.height = '';
        }

        editor.setStyle({ top: (top + 2) + 'px' });
        content.setStyle({ height: height + 'px' });
    }
    else
        textarea.rows = Math.floor((window.height() - textarea.offsetTop) / rowheight);
}

function onMailEditorClose(event) {
    if (window.shouldPreserve)
        window.shouldPreserve = false;
    else {
        if (window.opener && window.opener.open && !window.opener.closed) {
            var url = "" + window.location;
            var parts = url.split("/");
            parts[parts.length-1] = "delete";
            url = parts.join("/");
            window.opener.deleteDraft(url);
        }
    }

    if (MailEditor.addressBook && MailEditor.addressBook.open
        && !MailEditor.addressBook.closed)
        MailEditor.addressBook.close();

    Event.stopObserving(window, "beforeunload", onMailEditorClose);
}

document.observe("dom:loaded", initMailEditor);
