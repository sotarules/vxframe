import Parser from "html-react-parser"
import isEqual from "react-fast-compare"
import { createRoot } from "react-dom/client"

import { setIosState } from "/imports/vx/client/code/actions"
import { setFormData } from "/imports/vx/client/code/actions"
import { setLoading } from "/imports/vx/client/code/actions"

/**
 * User interface utility functions.
 */
UX = {

    /**
     * Go to the specified path.
     *
     * @param {string} Route path.
     */
    go(path) {
        console.log(`ux.js go path=${path}`)
        try {
            BrowserHistory.push(path)
        }
        catch (error) {
            OLog.error(`ux.js go unexpected error=${OLog.errorError(error)}`)
            return
        }
    },

    /**
     * Fire fade transitions by setting CSS class fire in elements marked with
     * class fade-first or fade-second.
     */
    fireFade() {
        Meteor.setTimeout(() => {
            Meteor.setTimeout(() => {
                $(".fade-first").addClass("fire")
                Meteor.setTimeout(() => {
                    $(".fade-second").addClass("fire")
                })
            })
        })
    },

    /**
     * Remove fire attributes.
     */
    clearFade() {
        $(".fade-first").removeClass("fire")
        $(".fade-second").removeClass("fire")
    },

    /**
     * Create a push notification using a server result object as input.
     *
     * @param {object} result Standard server result object.
     * @param {object} error Optional server error object.
     * @param {boolean} nomessage True to suppress notification if result is successful.
     * @param {boolean} defer True to defer execution.
     */
    notify(result, error, nomessage) {
        if (error) {
            OLog.error(`ux.js notify error=${OLog.errorError(error)}`)
            UX.notifyForError(error)
            return
        }
        if (!nomessage || (result && !result.success)) {
            UX.createNotificationForResult(result)
        }
    },

    /**
     * Create a push notification using an error object as input.
     *
     * @param {object} error Standard error object.
     */
    notifyForError(error) {
        UX.createNotificationForResult({ success : false, icon : "TRIANGLE", key : "common.alert_callback_error", variables : { error : error } })
    },

    /**
     * Create a push notification using a database error object as input.
     *
     * @param {object} error Database error object.
     */
    notifyForDatabaseError(error) {
        UX.createNotificationForResult(Util.getDatabaseErrorResult(error))
    },

    /**
     * Create an "under construction" notification.
     */
    notifyUnderConstruction() {
        UX.createNotificationForResult({ success : true, type : "INFO", icon : "TRIANGLE", key : "common.label_under_construction"})
    },

    /**
     * Create a PNotify notification based on a standard result object.
     *
     * @param {object} result Standard result object.
     */
    createNotificationForResult(result) {
        if (!result) {
            OLog.error("ux.js createNotificationForResult no result object supplied")
            return
        }
        let success = result.success ? "success" : "error"
        let type = result.type ? CX.NOTIFICATION_TYPE_MAP[result.type] : success
        let icon = CX.NOTIFICATION_ICON_MAP[result.icon || "ENVELOPE"]
        let text = Util.i18n(result.key, result.variables)
        UX.createNotification({ type : type, icon : icon, text : text })
    },

    /**
     * Create a PNotify notification.
     *
     * @param {object} parameters Parameters.
     */
    createNotification(parameters) {
        let width = $(window).width()
        let firstPos1 = 3
        let firstPos2 = -2
        if (width <= 480) {
            firstPos1 = 3
            firstPos2 = 3
        }
        else if (width <= 768) {
            firstPos1 = 3
            firstPos2 = 10
        }
        let notificationStack = $(".notification-container").data("notification-stack")
        if (!notificationStack) {
            notificationStack = {"dir1": "up", "dir2": "left", "firstpos1": firstPos1, "firstpos2": firstPos2, "spacing1": 0, "spacing2": 15, "context": $(".notification-container") }
            $(".notification-container").data("notification-stack", notificationStack)
        }
        parameters.addclass = "stack-bottomright"
        parameters.stack = notificationStack
        new PNotify(parameters)
    },

    /**
     * Create a legacy-style alert (Bootstrap).  This function has been largely superseded
     * by notify, which leverages PNotify.
     *
     * @param {string} type Bootstrap alert type (e.g., alert-danger, alert-warning, alert-info, alert-success).
     * @param {string} key Message key.
     * @param {object} variables Object consisting of variables to insert into message.
     * @param {string} selector Optional selector for placeholder div.
     */
    createAlertLegacy(type, key, variables, selector) {
        selector = selector || CX.SELECTOR_ALERT_PLACEHOLDER
        let localizedMessage = Util.i18n(key, variables)
        $(selector).append('<div id="alertdiv" style="opacity:0" class="alert ' + type + '"><a class="close" data-dismiss="alert">&times</a><span>' + localizedMessage + "</span></div>")
        $(".alert").animate( { opacity: 1 }, 500, "linear")
        Meteor.setTimeout(() => {
            $(".alert").animate( { opacity: 0 }, 500, "linear", function() {
                $(".alert").off("closed.bs.alert")
                UX.clearAlertLegacy(selector)
            })
        }, 4000)
    },

    /**
     * Clear alert(s).
     *
     * @param {string} selector Optional selector for placeholder div.
     */
    clearAlertLegacy(selector) {
        selector = selector || CX.SELECTOR_ALERT_PLACEHOLDER
        $(selector).empty()
    },

    /**
     * Make an array of objects based on the codes, each of which contains a code and localized value.
     *
     * @param {string} code Enumeration code name (see codes.js).
     * @returns {array} Array of properties and values.
     */
    makeCodeArray(code, includeBlank) {
        return Util.makeCodeArray(code, includeBlank)
    },

    /**
     * Return an array of all users with the specified role suitable for populating a VXSelect
     * component.
     *
     * @param {array} roleNames Optional array of role names to use as filter.
     * @return {array} Array of users bearing given role (prepared for <select>).
     */
    makeUserArray(roleNames) {
        return Util.makeUserArray(null, roleNames)
    },

    /**
     * Fix apparent bug in Holder.js. In this case, Holder assigns the stand-in
     * img element a property fluidRef, that points to a dynamically created div bearing
     * the stand-in "art".  After refresh, this causes Holder to believe that
     * the div has already been initialized.
     */
    fixHolder() {
        $("#img-holder").removeProp("fluidRef")
        $(".holderjs-fluid").remove()
        Holder.run()
    },

    /**
     * Determine whether this is a touch device.
     *
     * @return {boolean} true if this is a touch device.
     */
    isTouch() {
        return "ontouchstart" in document
    },

    /**
     * Capture the most recent touch event to arm the isTouchClick function.
     *
     * @param {object} Event to capture.
     */
    armTouchClick(event) {
        UXState.touchStartEvent = event
        console.log(`ux.js armTouchClick touch click armed timestamp=${event.timeStamp}`)
    },

    /**
     * Determine whether this is a superfluous click event on a touch device.
     *
     * @param {object} Event to test.
     * @return {boolean} true if this is a click event occurring on a touch device.
     */
    isTouchClick(event) {
        if (UXState.touchStartEvent) {
            let timeStampDifference = event.timeStamp - UXState.touchStartEvent.timeStamp
            if (timeStampDifference < 500) {
                console.log("ux.js isTouchClick recent touchstart detected, ignoring click detected timeStampDifference=" + timeStampDifference)
                return true
            }
        }
        return false
    },

    /**
     * Determine whether a touch-friendly hotzone has been clicked on non-touch device.
     *
     * @param {object} event Event to analyze.
     * @param {string} hotzoneClass Class of hotzone to test.
     * @return {boolean} true if touch-friendly hotzone was clicked on non-touch device.
     */
    isHotzoneClick(event, hotzoneClass) {
        let touchDevice = UX.isTouch()
        let hotzoneEvent = $(event.currentTarget).hasClass(hotzoneClass)
        if (!touchDevice && !hotzoneEvent) {
            //OLog.debug("ux.js isHotzoneClick non-touch device control clicked, control classes="+$(event.currentTarget).attr("class"))
        }
        else if (!touchDevice && hotzoneEvent) {
            //OLog.debug("ux.js isHotzoneClick non-touch device hotzone near control clicked, control classes="+$(event.currentTarget).attr("class"))
            return true  // This particular case should be ignored, because a desktop user clicked somewhere outside the control
        }
        else if (touchDevice && !hotzoneEvent) {
            //OLog.debug("ux.js isHotzoneClick touch device pressed control perfectly, control classes="+$(event.currentTarget).attr("class"))
        }
        else if (touchDevice && hotzoneEvent) {
            //OLog.debug("ux.js isHotzoneClick touch device missed control but pressed hotzone (as designed), control classes="+$(event.currentTarget).attr("class"))
        }
        return false
    },

    /**
     * Given a click event (triggered by clicking or touching a menu control), transform
     * the event into a "context" event compatible with react-contexify.
     *
     * @param {event} oldEvent Original event.
     */
    makeContextEvent(oldEvent ) {
        const offset = $(oldEvent.target).offset()
        let X
        let Y
        if (oldEvent.type === "touchstart") {
            X = oldEvent.changedTouches[0].clientX
            Y = oldEvent.changedTouches[0].clientY
        }
        else {
            X = oldEvent.clientX
            Y = oldEvent.clientY
        }
        // Create synthetic event transforming left-click to right-click:
        const newEvent = $.extend($.Event("contextmenu"), {
            which: 1,
            clientX: X,
            clientY: Y,
            pageX: offset.left,
            pageY: oldEvent.pageY,
            screenX: X,
            screenY: Y
        })
        return newEvent
    },

    /**
     * Convenience method to consume an event.
     *
     * @param {object} event Event.
     */
    consume(event) {
        OLog.debug(`ux.js consume event will be neutralized, event=${event.type}`)
        event.preventDefault()
        event.stopPropagation()
    },

    /**
     * Fix scroll after resizing or orientation change.
     *
     * @param {string} selector JQuery selector of list to fix.
     */
    fixScroll(selector) {
        let $selector = $(selector)
        //OLog.debug("ux.js fixScroll, selector="+selector+" elements selected="+$selector.length)
        $selector.removeClass("scroll-momentum")
        setTimeout(() => {
            $selector.addClass("scroll-momentum")
        }, 10)
    },

    /**
     * Start editing the current element via contenteditable.
     *
     * @param {object} $element JQuery element to edit.
     * @param {boolean} selectText True to select  text in contenteditable.
     */
    startEditing($element, selectText) {
        $element.attr("contenteditable", true)
        $element.addClass("selectable")
        $element.trigger("focus")
        if (selectText) {
            $element.selectText()
        }
    },

    /**
     * Stop editing the currently-editing element.
     *
     * @param {object} $element jQuery element that is contenteditable.
     * @param {boolean} blur True to blur.
     */
    stopEditing($element, blur) {
        if (blur) {
            $element.blur()
        }
        const contenteditable = $element.attr("contenteditable")
        if (contenteditable) {
            $element.attr("contenteditable", false)
        }
        window.getSelection().removeAllRanges()
        const selectable = $element.hasClass("selectable")
        if (selectable) {
            $element.removeClass("selectable")
        }
    },

    /**
     * Get the moment-compatible timezone from the current viewer.
     *
     * @return {number} Integer timezone value compatible with moment.
     */
    timezone() {
        return moment().zone() / 60
    },

    /**
     * Determine whether Bootstrap grid has collapsed into a single column.
     *
     * @return {boolean} True if grid is collapsed (small device).
     */
    isGridCollapsed() {
        return $(window).width() < 768
    },

    /**
     * Determine whether this is a phone.
     *
     * @return {boolean} True if device is a phone.
     */
    isPhone() {
        return $(window).width() <= 480
    },

    /**
     * Determine whether this is a pad (portrait).
     *
     * @return {boolean} True if device is a pad (portrait).
     */
    isPad() {
        return $(window).width() > 480 && $(window).width() <= 768
    },

    /**
     * A problem with Firefox and IE: lists of items that have tabindex=0 set will not
     * automatically receive focus when clicked.  This doesn't seem to affect Chrome or Safari, including
     * iOS.  As a work-around, when an element is clicked, ensure that the element is
     * programmatically focused if it has not already been focused implicitly.
     *
     * @param {object} event Click event.
     * @param {string} selector Class name of container to receive focus.
     */
    fixFocus(event, selector) {
        let $container = $(event.target).closest(selector)
        if (!$container.exists()) {
            OLog.error(`ux.js fixFocus selector=[${selector}] could not find container, no action will be taken`)
        }
        if ($container.is(":focus")) {
            OLog.debug(`ux.js fixFocus selector=[${selector}] container already has focus, no action will be taken`)
        }
        else {
            OLog.debug(`ux.js fixFocus selector=[${selector}] container does not already have focus, setting focus programmatically`)
            $container.focus()
        }
    },

    /**
     * Trim the specified value and convert to null if no characters are present.
     *
     * @param {string} input Input value.
     * @return {string} Trimmed value or null.
     */
    trim(input) {
        if (!input) {
            return
        }
        input = input.trim()
        return input.length > 0 ? input : null
    },

    /**
     * Initialize component drag/drop. This function has been optimized to initialize
     * both drag/drop in a single call because sortable initialization is slow with large lists.
     *
     * @param {string} id HTML element ID to made draggable.
     * @param {string} dropClassName Drop class name (used with connectWith).
     * @param {string} placeholderClassName Placeholder class name.
     * @param {object} component Component that is drag source.
     * @param {boolean} draggable True to make component draggable.
     * @param {boolean} droppable True to make component droppable.
     */
    makeDraggableDroppable(id, dropClassName, placeholderClassName, component, draggable, droppable) {
        if (!(draggable || droppable)) {
            return
        }
        const $list = $(`#${id}`)
        let parameters = {
            handle : ".entity-handle",
            placeholder : placeholderClassName,
            change : (event, ui) => {
                UX.initPlaceholder(ui, dropClassName)
            }
        }
        if (draggable) {
            parameters = { ...parameters, ...{
                cursor : "move",
                appendTo : document.body,
                zIndex : 2000,
                opacity : ".7",
                connectWith : `.${dropClassName}`,
                scroll : false,
                helper(event, $element) {
                    return UX.makeHelper(event, $element)
                },
                stop() {
                    $list.sortable("cancel")
                },
                hideDragged(event, ui) {
                    if (!component.props.dragClone && component.props.droppable) {
                        UX.hideSelected(event, ui, $list)
                    }
                },
            }}
        }
        if (droppable) {
            parameters = { ...parameters, ...{
                update : function(event, ui) {
                    const thisId = this.id
                    const parentId = ui.item.parent().attr("id")
                    const ignore = thisId !== parentId
                    OLog.debug(`ux.js makeDraggableDroppable update thisId=${thisId} parentId=${parentId} ignore=${ignore}`)
                    if (ignore) {
                        return
                    }
                    OLog.debug(`ux.js makeDraggableDroppable onDrop *fire* id=${component.props.id}`)
                    if (component.props.onDrop) {
                        const dropInfo = UX.makeDropInfo(event, ui, component, $list)
                        component.props.onDrop(dropInfo)
                    }
                },
                stop() {
                    UX.hideTargetItems()
                    $list.sortable("cancel")
                    Meteor.setTimeout(() => {
                        UX.showTargetItems()
                        $list.scrollTop(UXState.originalTargetState.scrollTop)
                    })
                },
                showDragged(event, ui) {
                    UX.showSelected(event, ui, $list)
                }
            }}
        }
        $list.sortable(parameters)
    },

    /**
     * Custom helper to support multiple drag/drop.
     *
     * @param {object} event Event from JQuery sortable.
     * @param {object} $element jQuery element being dragged.
     * @return {object} jQuery helper (either single or multi-row)
     */
    makeHelper(event, $element) {
        UXState.originalIds = UX.captureOriginalIds($element)
        UXState.originalTargetState = UX.captureTargetState($element.parents(".vx-list"))
        const helperHeight = _.reduce($element.parents(".vx-list").children(".selected"), (memo, child) => {
            return memo + $(child).outerHeight(true)
        }, 0) + 1
        const $listClone = $element.parents(".vx-list").clone()
        _.each($listClone.children(), child => {
            $(child).attr("id", `helper-${$(child).attr("id")}`)
        })
        $listClone.children(":not(.selected)").remove()
        $listClone.find(".entity-control-set").remove()
        const height = `${helperHeight}px`
        const css = {}
        css.height = height
        css["min-height"] = height
        css["max-height"] = height
        css["overflow-y"] = "hidden"
        $listClone.css(css)
        UXState.$helper = $listClone
        return $listClone
    },

    /**
     * Hide all selected elements (support multiple drag/drop).
     *
     * @param {object} event Event from JQuery sortable.
     * @param {object} ui jQuery UI object.
     * @param {object} $targetElement List being modified.
     */
    hideSelected(event, ui, $targetElement) {
        $targetElement.children(".selected").hide()
    },

    /**
     * Show all selected elements (support multiple drag/drop).
     *
     * @param {object} event Event from JQuery sortable.
     * @param {object} ui jQuery UI object.
     * @param {object} $targetElement List being modified.
     */
    showSelected(event, ui, $targetElement) {
        $targetElement.children(".selected").show()
    },

    /**
     * Initialize placeholder display setting for jQuery UI.
     *
     * @param {object} ui jQuery UI object.
     * @param {string} droppableClassName Droppable class name.
     * @param {boolean} horizontal Horizontal list.
     */
    initPlaceholder(ui, droppableClassName, horizontal) {
        const $parent = ui.placeholder.parent()
        const parentDroppable = $parent.hasClass(droppableClassName)
        const listGroup = $parent.hasClass("list-group")
        const emptyList = $parent.hasClass("empty-list")
        const actualList = listGroup && !emptyList
        const blockType = (horizontal ? "inline-block" : "block")
        const css = {}
        const height = `${ui.helper.outerHeight()}px`
        css.display = parentDroppable && actualList ? blockType : "none"
        css.height = height
        css["min-height"] = height
        css["max-height"] = height
        ui.placeholder.css(css)
    },

    /**
     * Capture ID array of dragged list before damage.
     *
     * @param {object} $element jQuery element being dragged.
     */
    captureOriginalIds($element) {
        const originalIds = []
        const $list = $element.parents(".vx-list")
        $list.children().each((index, child) => {
            const id = $(child).attr("data-item-id")
            if (id) {
                originalIds.push(id)
            }
        })
        return originalIds
    },

    /**
     * Make a general-purpose drop information object to add in drop processing.
     *
     * clone: true indicates that drag/drop is from one list to another (clone).
     * targetIndex: target index where dropped item(s) are to be inserted.
     * items: list of items to be dropped of the form { _id: "r6m3kjxhcAZuTBXBF", sourceIndex: 1 }
     *
     * @param {object} event jQuery sortable update event.
     * @param {object} ui jQuery sortable information.
     * @param {object} component React component receving drop.
     * @param {object} $entityTarget jQuery element representing drop target.
     * @return {object} Drop info object.
     */
    makeDropInfo(event, ui, component, $entityTarget) {
        const itemIdArray = []
        $entityTarget.children(".vx-list-item").each(function() {
            return itemIdArray.push($(this).attr("data-item-id"))
        })
        const dropInfo = {}
        dropInfo.event = event
        dropInfo.senderId = ui.sender?.attr("id")
        dropInfo.targetId = $entityTarget.attr("id")
        dropInfo.itemId = ui.item?.attr("id")
        dropInfo["data-item-id"] = ui.item?.attr("data-item-id")
        dropInfo.component = component
        dropInfo.$entityTarget = $entityTarget
        dropInfo.clone = UX.isDropClone(ui, component)
        dropInfo.targetIndex = itemIdArray.indexOf(dropInfo["data-item-id"])
        dropInfo.items = []
        UXState.$helper.children().each((index, helperChild) => {
            const item = {}
            item.id = $(helperChild).attr("id")
            item["data-item-id"] = $(helperChild).attr("data-item-id")
            if (!dropInfo.clone) {
                item.sourceIndex = UXState.originalIds.indexOf(item["data-item-id"])
            }
            dropInfo.items.push(item)
        })
        const prevIndex = dropInfo.targetIndex - 1
        const nextIndex = dropInfo.targetIndex + 1
        if (prevIndex >= 0) {
            dropInfo.prevTargetItemId = itemIdArray[prevIndex]
        }
        if (nextIndex < itemIdArray.length) {
            dropInfo.nextTargetItemId = itemIdArray[nextIndex]
        }
        return dropInfo
    },

    /**
     * Capture the state of the drop zone prior to cancel.
     *
     * @param {object} $entityTarget jQuery element representing drop target.
     * @return {object} Original state bearing scrollTop and display.
     */
    captureTargetState($entityTarget) {
        const scrollTop = $entityTarget.scrollTop()
        const elementObjects = $entityTarget.children(".vx-list-item").toArray().map(element => {
            const id = $(element).attr("id")
            const display = $(element).css("display") || ""
            return { id, display }
        })
        return { scrollTop, elementObjects }
    },

    /**
     * Hide target items.
     */
    hideTargetItems() {
        const targetState = UXState.originalTargetState
        targetState.elementObjects.forEach(elementObject => {
            const id = elementObject.id
            $(`#${id}`).css("display", "none")
        })
    },

    /**
     * Show target items.
     */
    showTargetItems() {
        const targetState = UXState.originalTargetState
        targetState.elementObjects.forEach(elementObject => {
            const id = elementObject.id
            const $element = $(`#${id}`)
            $element.css("display", elementObject.display)
        })
    },

    /**
     * Determine whether this is a clone (creational) operation.
     *
     * @param {object} ui jQuery sortable ui object.
     * @param {object} component Component receiving drop.
     * @return {boolean} True if this is a clone operation.
     */
    isDropClone(ui, component) {
        if (!ui.sender) {
            return false
        }
        if (component.props.dropClone) {
            return true
        }
        const draggable = ui.sender.hasClass("vx-draggable")
        const droppable = ui.sender.hasClass("vx-droppable")
        return draggable && !droppable
    },

    /**
     * Return the IDs of selected rows that are children of the supplied id.
     *
     * @param {string} listId List ID.
     * @return {array} Array of selected child IDs.
     */
    selectedRowIds(listId) {
        return UX.selectedIds(listId, "data-item-id")
    },

    /**
     * Return the database IDs of selected rows that are children of the supplied id.
     *
     * @param {string} listId List ID.
     * @return {array} Array of selected database IDs.
     */
    selectedDbIds(listId) {
        return UX.selectedIds(listId, "data-db-id")
    },

    /**
     * Return the IDs of selected rows that are children of the supplied id.
     *
     * @param {string} listId List ID.
     * @param {string} attributeName Name of data attribute with ID.
     * @return {array} Array of selected child IDs.
     */
    selectedIds(listId, attributeName) {
        const selectedIds = []
        $(`#${listId}`).children(".selected").each((index, child) => {
            const id = $(child).attr(attributeName)
            if (id) {
                selectedIds.push(id)
            }
        })
        return selectedIds
    },

    /**
     * Update redux slide mode state if necessary.
     */
    updateSlideMode() {
        const iosState = { ...Store.getState().iosState }
        const slideModeOld = iosState.slideMode
        const slideModeNew = VXApp.isSlideMode()
        if (slideModeNew === slideModeOld) {
            return
        }
        OLog.debug(`ux.js updateSlideMode *changed* slideModeOld=${slideModeOld} slideModeNew=${slideModeNew}`)
        UX.mutatePanelMap(iosState, Util.routePath(), "LEFT")
        iosState.slideMode = slideModeNew
        Store.dispatch(setIosState(iosState))
        const slidePair = UX.findComponentById("vx-slide-pair")
        if (slidePair) {
            UX.setAnimation("vx-slide-pair", null)
        }
    },

    /**
     * Determine whether the system is in slide mode.
     *
     * @return {boolean} True if the system is in slide mode.
     */
    isSlideMode() {
        return Store.getState().iosState.slideMode === true
    },

    /**
     * Get iOS button bar visibility state.
     *
     * @param {object} iosState iOS state object.
     * @return {boolean} True if iOS button bar is visible.
     */
    isIosButtonBarVisible(iosState) {
        return UX.isIosBackButtonVisible(iosState) || UX.isIosButtonBarDelegatesVisible(iosState)
    },

    /**
     * Get iOS back button visibility state.
     *
     * @param {object} iosState iOS state object.
     * @return {boolean} True if back button is visible.
     */
    isIosBackButtonVisible(iosState) {
        if (iosState && iosState.stack && iosState.stack.length > 0) {
            return (iosState.slideMode ? !!iosState.minorBackLabel : !!iosState.majorBackLabel)
        }
        return false
    },

    /**
     * Get iOS button bar delegates visibility state.
     *
     * @param {object} iosState iOS state object.
     * @return {boolean} True if any iOS button bar delegates are visible.
     */
    isIosButtonBarDelegatesVisible(iosState) {
        if (!iosState.iosButtonState) {
            return false
        }
        if (!iosState.slideMode) {
            return Object.keys(iosState.iosButtonState).length > 0
        }
        const currentPanel = UX.getCurrentPanel(Util.routePath())
        return !!_.findWhere(iosState.iosButtonState, { position : currentPanel.toLowerCase() })
    },

    /**
     * Get the contents of the iOS stack.
     *
     * @return {array} iOS stack.
     */
    getIosStack() {
        return Store.getState().iosState.stack || []
    },

    /**
     * Return the localized current back label, either major or minor.
     *
     * @param {boolean} slideMode Slide mode.
     * @param {string} majorBackLabel Major back label key.
     * @param {string} minorBackLabel Minor back label key.

     * @return {string} Localized back label.
     */
    backLabel(iosState) {
        // This is right, we have both regular-mode and slide-mode back buttons.
        // In slide mode, you'll usually go back to the singular element because
        // you're going back to panel RIGHT typically body. In regular mode, you
        // go back to panel LEFT with RIGHT on the side, and plural makes more
        // sense because when both LEFT and RIGHT are shown, you're dealing with a
        // list:
        let backLabel = iosState.slideMode ? iosState.minorBackLabel : iosState.majorBackLabel
        if (backLabel) {
            return Util.i18n(backLabel)
        }
        return null
    },

    /**
     * Get current panel.
     *
     * @param {string} path Route path.
     * @return {string} Panel (i.e, LEFT, RIGHT, BOTH).
     */
    getCurrentPanel(path) {
        let panelMap = Store.getState().iosState.panelMap || {}
        let routeSegmentFirst = Util.routeFirstSegment(path)
        let panel = panelMap[routeSegmentFirst]
        return panel || VXApp.getInitialPanel(path)
    },

    /**
     * Add the specified route/panel to the panel map contained
     * in the supplied iosState (in-place mutation).
     *
     * @param {object} iosState iOS state object.
     * @param {string} path Route path.
     * @param {string} panel Panel LEFT or RIGHT.
     */
    mutatePanelMap(iosState, path, panel) {
        iosState.panelMap = iosState.panelMap || {}
        let routeSegmentFirst = Util.routeFirstSegment(path)
        iosState.panelMap[routeSegmentFirst] = panel
    },

    /**
     * Set the animation inside a given animation container.
     *
     * @param {string} componentId Component ID.
     * @param {string} animation Animation to set.
     */
    setAnimation(componentId, animation) {
        const component = UX.findComponentById(componentId)
        if (!component) {
            console.log(`ux.js setAnimation unable to find componentId=${componentId}`)
            OLog.error(`ux.js setAnimation unable to find componentId=${componentId}`)
            return
        }
        OLog.debug(`ux.js setAnimation componentId=${componentId} animation=${animation}`)
        component.setAnimation(animation)
    },

    /**
     * Get the current animation from a specified animation container.
     *
     * @param {string} componentId Component ID.
     * @return {string} Animation currently set.
     */
    getAnimation(componentId) {
        const component = UX.findComponentById(componentId)
        if (!component) {
            console.log(`ux.js getAnimation unable to find componentId=${componentId}`)
            OLog.error(`ux.js getAnimation unable to find componentId=${componentId}`)
            return
        }
        component.getAnimation()
    },


    /**
     * Enable the specified iOS button (or all buttons if no selector specified).
     *
     * @param {string} selector Selector of button to enable.
     */
    iosEnable(selector) {
        selector = selector || ".ios-disabled"
        let $buttons = $(selector)
        $buttons.removeClass("ios-disabled")
    },

    /**
     * Disable the specified iOS button (or all buttons if no selector specified).
     *
     * @param {string} selector Selector of button to enable.
     */
    iosDisable(selector) {
        selector = selector || ".ios-button-group-member"
        let $buttons = $(selector)
        $buttons.addClass("ios-disabled")
    },

    /**
     * Determine whether the specified iOS button is enabled.
     *
     * @param {selector} selector Selector of button.
     * @return {boolean} True if button is enabled.
     */
    iosIsEnabled(selector) {
        return !$(selector).hasClass("ios-disabled")
    },

    /**
     * Determine whether the specified iOS button is disabled.
     *
     * @param {selector} selector Selector of button.
     * @return {boolean} True if button is disabled.
     */
    iosIsDisabled(selector) {
        return $(selector).hasClass("ios-disabled")
    },

    /**
     * Determine whether a given route path is the current route path, or
     * if not, if it is a path currently on the iOS stack.
     *
     * @param {string} routePath Route path to find.
     * @return {boolean} True if the specified route path is current or on stack.
     */
    iosIsRoutePathOnStack(routePath) {
        if (Util.isRoutePath(routePath)) {
            return true
        }
        let stack = UX.getIosStack()
        let found = false
        stack.every(state => {
            if (state.path.indexOf(routePath) >= 0) {
                found = true
                return false
            }
            return true
        })
        return found
    },

    /**
     * Determine whether a given route path is the referrer, that is to say,
     * it is most recently-added route on the stack.
     *
     * @param {string} routePath Route path to find.
     * @return {boolean} True if the specified route is the referrer.
     */
    iosIsRouteReferrer(routePath) {
        const stack = UX.getIosStack()
        if (stack.length === 0) {
            return false
        }
        const lastPath = stack[stack.length - 1].path
        return lastPath.startsWith(routePath)
    },

    /**
     * Prevent iOS "rubber-banding" on scroll.
     */
    noRubberBand() {
        // Disable scroll for the document, we'll handle it ourselves
        document.addEventListener("touchmove", function(e) {
            e.preventDefault()
        }, { passive: false })
        document.body.addEventListener("touchstart", function(e) {
            const listElement = UX.listElement(e.target)
            if (!listElement) {
                return
            }
            // See if we're already scrolled to the extreme top or bottom:
            this.allowUp = listElement.scrollTop > 0
            this.allowDown = listElement.scrollTop < (listElement.scrollHeight - listElement.clientHeight)
            // Remember where the touchstart began so we can compute the shift in X or Y later:
            this.lastX = e.touches[0].pageX
            this.lastY = e.touches[0].pageY
        }, { passive: false })
        // Anti-rubber-banding on iOS part II:
        document.body.addEventListener("touchmove", function(e) {
            const listElement = UX.listElement(e.target)
            if (!listElement) {
                return
            }
            const pageX = e.touches[0].pageX
            const pageY = e.touches[0].pageY
            const up = pageY > this.lastY
            const down = !up
            const deltaX = Math.abs(pageX - this.lastX)
            const deltaY = Math.abs(pageY - this.lastY)
            // If the deltaY is greater than deltaX, this is largely a Y move.  Only a significantly Y
            // move will trigger the anti-rubber-banding logic:
            if (deltaY > deltaX) {
                if (up && !this.allowUp) {
                    event.preventDefault()
                    return
                }
                if (down && !this.allowDown) {
                    event.preventDefault()
                    return
                }
            }
            // Ironically, stopPropagation is tantamount to allowing the events to take effect:
            event.stopPropagation()
        }, { passive: false })
    },

    /**
     * Return the list element "above" the supplied element.
     *
     * @param {object} element DOM element to test.
     * @return {boolean} List element if available
     */
    listElement(element) {
        const $element = $(element).closest(".scroll-momentum")
        return $element.exists() ? $element[0] : null
    },

    /**
     * Toggle the collapsed state of the right side panel.
     *
     * @param {string} advancedSelector Selector of "advanced" division.
     * @param {string} collapseSelector Selector of collapse control.
     */
    toggleCollapse(advancedSelector, collapseSelector) {
        let $advanced = $(advancedSelector)
        let $collapseControl = $(collapseSelector)
        let advancedVisible = $advanced.hasClass("in")
        if (advancedVisible) {
            $advanced.collapse("hide")
            $collapseControl.removeClass("fa-chevron-up")
            $collapseControl.addClass("fa-chevron-down")
        }
        else {
            $advanced.collapse("show")
            $collapseControl.removeClass("fa-chevron-down")
            $collapseControl.addClass("fa-chevron-up")
        }
    },

    /**
     * Display please wait.
     */
    showLoading() {
        if (UXState.loading) {
            return
        }
        OLog.debug("ux.js showLoading *fire*")
        let message =  "<p class='loading-message'>" + Util.i18n("common.message_loading") + "</p>"
        let circle = "<div class='sk-spinner sk-spinner-wordpress'><span class='sk-inner-circle'></span></div>"
        UXState.loading = window.pleaseWait({ logo : CX.LOGO_PATH, backgroundColor : "#FFFFFF", loadingHtml : message + circle })
    },

    /**
     * Finish please wait.
     */
    clearLoading() {
        if (UXState.loading) {
            OLog.debug("ux.js clearLoading *fire*")
            UXState.loading.finish()
            UXState.loading = null
        }
    },

    /**
     * Setter for redux loading.
     *
     * @param {boolean} loading Loading indicator.
     */
    setLoading(loading) {
        if (Store.getState().loading !== loading) {
            OLog.debug(`ux.js setLoading loading=${loading}`)
            Store.dispatch(setLoading(loading))
        }
    },

    /**
     * Wait on multiple subscriptions and invoke callback when ready.
     *
     * @param {array} handles Array of subscription handles.
     * @param {function} callback Callback.
     */
    waitSubscriptions(handles, callback) {
        OLog.debug(`ux.js waitSubscriptions *waiting* total of ${handles.length} subscriptions to be published`)
        try {
            if (UX.areSubscriptionsReady(handles)) {
                OLog.debug("ux.js waitSubscriptions immediately *ready* continue")
                callback(null, { success: true })
                return
            }
            Tracker.autorun(computation => {
                if (UX.areSubscriptionsReady(handles)) {
                    OLog.debug(`ux.js waitSubscriptions *ready* total of ${handles.length} subscriptions ` +
                        "published stopping wait computation and invoking post-publication callback")
                    computation.stop()
                    callback(null, { success: true })
                    return
                }
            })
        }
        catch (error) {
            OLog.error("ux.js waitSubscriptions unexpected error=" + error)
            return
        }
    },

    /**
     * Determine whether all subscriptions within a supplied array are ready.
     *
     * @param {array} handles Array of subscription handles.
     * @return {boolean} True if all subscriptions are ready.
     */
    areSubscriptionsReady(handles) {
        let subscriptionsReady = true
        _.each(handles, handle => {
            subscriptionsReady = subscriptionsReady && handle.ready()
        })
        return subscriptionsReady
    },

    /**
     * Toggle navigation smoothly using hardware animation.
     */
    toggleNav() {
        if ($("#offcanvas-menu-react").hasClass("navslide-show")) {
            $("#offcanvas-menu-react").removeClass("navslide-show").addClass("navslide-hide")
            $(".navbar").removeClass("navslide-show").addClass("navslide-hide")
            $(".nav-canvas").removeClass("navslide-show").addClass("navslide-hide")
        }
        else {
            $(".nav-canvas").css("position", "relative")
            $("#offcanvas-menu-react").removeClass("navslide-hide").addClass("navslide-show")
            $(".navbar").removeClass("navslide-hide").addClass("navslide-show")
            $(".nav-canvas").removeClass("navslide-hide").addClass("navslide-show")
        }
    },

    /**
     * Clear special classes and reset for next animation.
     */
    resetNav() {
        $(".nav-canvas").css("position", "")
        $("#offcanvas-menu-react").removeClass("navslide-hide")
        $(".navbar").removeClass("navslide-hide")
        $(".nav-canvas").removeClass("navslide-hide")
    },

    /**
     * New React.js validation function for VXForm.
     *
     * @param {object} component React.js Component.
     */
    async validateComponent(component) {
        const result = await UX.validateInstance(component)
        if (!result.success) {
            return
        }
        if (component.props.siblings) {
            for (let siblingId of component.props.siblings) {
                let siblingComponent = UX.findComponentById(siblingId)
                let siblingResult = await UX.validateInstance(siblingComponent)
                if (!siblingResult.success) {
                    break
                }
            }
        }
        return
    },

    /**
     * Validate a field either client or server side.
     * Generate popovers and alerts accordingly.
     *
     * @param {object} component Component.
     * @return {object} Result object.
     */
    async validateInstance(component) {
        const form = UX.findForm(component.props.id)
        const validateArgs = UX.prepareValidateArgs(component)
        let result = { success: true }
        if (!form) {
            return result
        }
        if (form.props.dynamic && Util.isNullish(validateArgs[0])) {
            if (component.props.required) {
                if (component.props.missingReset) {
                    component.reset()
                }
                return { success : false, icon : "TRIANGLE", key : "common.required_fields_incomplete" }
            }
        }
        else if (!Util.isNullish(validateArgs[0])) {
            if (component.props.rule) {
                if (_.isString(component.props.rule)) {
                    OLog.debug(`ux.js validateInstance invoking server-side rule ${component.props.rule}`)
                    result = await UX.call("validateServerSide", component.props.rule, validateArgs)
                    OLog.debug(`ux.js validateInstance server-side result=${OLog.debugString(result)}`)
                }
                else {
                    result = component.props.rule.apply(component, validateArgs)
                }
            }
        }
        UX.validateFinish(component, validateArgs, result)
        return result
    },

    /**
     * Handle the results of the validation.  If an error occurs, display popover(s).
     * If no message was generated, and if dynamic mode, update the database directly.
     *
     * @param {object} component Component.
     * @param {array} validateArgs Validation arguments.
     * @param {object} result Result object from validation.
     */
    validateFinish(component, validateArgs, result) {
        // If the validation rule says the data is valid, send back formatted data
        // into the component and potentially update the database:
        if (result.success) {
            UX.deleteErrorFromComponent(component)
            UX.returnFormattedFields(component, validateArgs)
            if (UX.isFormDynamic(component)) {
                UX.updateDatabase(component)
            }
            if (UX.isFormRedux(component)) {
                UX.updateRedux(component)
            }
        }
        else {
            if (component.props.invalidHandler) {
                component.props.invalidHandler(component, validateArgs, result)
            }
            let localizedMessage = Util.i18n(result.key, result.variables)
            // Create errors and popovers for the primary field:
            UX.addErrorToComponent(component, localizedMessage)
            // Set the error state for all other fields:
            if (component.props.extra) {
                _.each(component.props.extra, (extraId) => {
                    let extraComponent = UX.findComponentById(extraId)
                    UX.addErrorToComponent(extraComponent, localizedMessage)
                })
            }
        }
    },

    /**
     * Given a binding, prepare and return an arguments array in proper
     * order for calling the validation function.
     *
     * @param {object} component Component.
     * @returns {array} Arguments array for validation function.
     */
    prepareValidateArgs(component) {

        // Prepare array of validation inputs:
        let validateArgs = []

        // Get primary value first:
        validateArgs.push(component.getValue())

        // Format any extra components:
        if (component.props.extra) {
            _.each(component.props.extra, (extraId) => {
                let extraComponent = UX.findComponentById(extraId)
                let value = extraComponent.getValue()
                validateArgs.push(value)
            })
        }

        // Append supplemental values to validateArgs array:
        let supplementalValues = UX.getSupplementalValues(component)
        validateArgs = validateArgs.concat(supplementalValues)

        return validateArgs
    },

    /**
     * Get supplemental values array.
     *
     * @param {object} component Component.
     * @return {array} Supplemental values array.
     */
    getSupplementalValues(component) {
        if (component.props.supplement) {
            let supplementalValues = []
            _.each(component.props.supplement, (supplementId) => {
                let supplementComponent = UX.findComponentById(supplementId)
                if (!supplementComponent) {
                    OLog.error(`ux.js getSupplementalValues for componentId=${component.props.id} ` +
                        `unable to find supplementId=${supplementId}`)
                    return
                }
                let value = supplementComponent.getValue()
                supplementalValues.push(value)
            })
            return supplementalValues
        }
        else if (component.props.supplementalValues) {
            return component.props.supplementalValues
        }
        return []
    },


    /**
     * Return formatted data to the form.
     *
     * @param {object} component Component.
     * @param {array} validateArgs Validation arguments.
     */
    returnFormattedFields(component, validateArgs) {
        component.setValue(validateArgs[0])
        let validateIndex = 1
        if (component.props.extra) {
            _.each(component.props.extra, (extraId) => {
                let extraComponent = UX.findComponentById(extraId)
                extraComponent.setValue(validateArgs[validateIndex])
                validateIndex++
            })
        }
    },

    /**
     * Given a component and a value, use the component formatting rule to
     * render that value.
     *
     * @param {object} component Component.
     * @param {string} value Value.
     * @param {array} supplementalValues Optional supplemental values array.
     * @return {string} Value rendered according to formatting rule.
     */
    render(component, value, supplementalValues) {
        let formatArgs = UX.getFormatArgs(component, value, supplementalValues)
        let result = component.props.format.render.apply(component, formatArgs)
        return Util.getNullAsEmpty(result)
    },

    /**
     * Given a component and a value, convert that value into internal form
     * by invoking the format strip rule.
     *
     * @param {object} component Component.
     * @param {string} value Value.
     * @param {array} supplementalValues Optional supplemental values array.
     * @return {string} Stripped value.
     */
    strip(component, value, supplementalValues) {
        let formatArgs = UX.getFormatArgs(component, value, supplementalValues)
        return component.props.format.strip.apply(component, formatArgs)
    },

    /**
     * Get parsed value given a component declared binding type.
     *
     * @param {object} component Component bearing binding type.
     * @param {string} value Raw value (typically string).
     * @param {string} dateFormat Optional date format for Date type.
     * @param {string} timezone Optional timezone for Date type.
     * @return {?} Parsed value or null if input is nullish.
     */
    parsedValue(component, value, dateFormat, timezone) {
        return Util.parsedValue(component.props.bindingType, value, dateFormat, timezone)
    },

    /**
     * Construct arguments needed for formatting rules.  The structure is an array
     * where the first element is the value to be formatted, followed by any
     * supplemental values needed by the formatting rule.
     *
     * @param {object} component Component.
     * @param {string} value Value.
     * @param {array} supplementalValues Optional supplemental values array.
     * @return {array} Array of format arguments (suitable for apply function).
     */
    getFormatArgs(component, value, supplementalValues) {
        let formatArgs = [value]
        supplementalValues = supplementalValues || UX.getSupplementalValues(component)
        return formatArgs.concat(supplementalValues)
    },

    /**
     * Create a new error associated with the specified component.
     *
     * @param {object} component Component.
     * @param {string} localizedMessage Validation error message.
     * @param {boolean} requiredField True to signal required-field error.
     */
    addErrorToComponent(component, localizedMessage, requiredField) {
        component.setState({ error : true, localizedMessage : localizedMessage }, () => {
            //component.props.addError(component)
            UX.addError(component)
        })
        // No extra processing for required fields, flag first empty field only:
        if (requiredField) {
            return
        }
        if (component.props.extra) {
            _.each(component.props.extra, (extraId) => {
                let extraComponent = UX.findComponentById(extraId)
                extraComponent.setState({ error : true, localizedMessage : localizedMessage }, () => {
                    //extraComponent.props.addError(extraComponent)
                    UX.addError(component)
                })
            })
        }
    },

    /**
     * Clear a component error.
     *
     * @param {object} component Component.
     */
    deleteErrorFromComponent(component) {
        component.setState({ error : false, localizedMessage : "" }, () => {
            UX.deleteError(component)
        })
        if (component.props.extra) {
            _.each(component.props.extra, (extraId) => {
                let extraComponent = UX.findComponentById(extraId)
                extraComponent.setState({ error : false, localizedMessage : "" }, () => {
                    UX.deleteError(extraComponent)
                })
            })
        }
    },

    /**
     * Clear any errors from the form.
     *
     * @param {object} form Form to clear.
     */
    clearAllErrors(form) {
        for (let component of form.components) {
            if (component.state.error) {
                UX.deleteErrorFromComponent(component)
            }
        }
        return true
    },

    /**
     * Iterate over the components in a form to ensure that all required
     * fields have values and that none of those fields have errors.
     *
     * @param {object} form Form to check.
     * @param {array} excludeComponentIds Optional array of IDs of components to exclude.
     * @return {boolean} True if form is complete and valid.
     */
    checkForm(form, excludeComponentIds) {
        for (let component of form.components) {
            if (excludeComponentIds && _.contains(excludeComponentIds, component.props.id)) {
                OLog.debug("ux.js checkForm excluded componentId=" + component.props.id)
                continue
            }
            if (!UX.checkComponentRequired(component)) {
                return false
            }
            if (component.state.error) {
                UX.notify({ success : false, icon : "TRIANGLE", key : "common.errors_on_form"})
                return false
            }
        }
        return true
    },

    /**
     * Check the component comparing its value with its required field, taking into
     * account the special case of tandem fields.  Create form errors and alerts
     * as necessary.
     *
     * @param {object} component Component to check.
     * @return {boolean} True if all required components have values.
     */
    checkComponentRequired(component) {
        let popoverComponent = null
        let valid = true
        if (component.props.required) {
            if (component.props.tandem) {
                let tandemComponent = UX.findComponentById(component.props.tandem)
                if (tandemComponent) {
                    if (!Util.isNullish(component.getValue()) && Util.isNullish(tandemComponent.getValue())) {
                        valid = false
                        popoverComponent = tandemComponent
                    }
                    if (Util.isNullish(component.getValue()) && !Util.isNullish(tandemComponent.getValue())) {
                        valid = false
                        popoverComponent = component
                    }
                }
                else {
                    OLog.error("ux.js checkComponentRequired unable to find tandem componentId=" + component.props.tandem)
                    valid = false
                }
            }
            else {
                if (Util.isNullish(component.getValue())) {
                    valid = false
                    popoverComponent = component
                }
            }
            if (!valid) {
                UX.addErrorToComponent(popoverComponent, Util.i18n("common.required_field_here"), true)
                UX.notify({ success : false, icon : "TRIANGLE", key : "common.required_fields_incomplete"})
                return false
            }
        }
        return true
    },

    /**
     * Return the value of the specified component.
     *
     * @param {string} id Component ID.
     * @return {object} Component value.
     */
    getComponentValue(id) {
        let component = UX.findComponentById(id)
        if (!component) {
            return
        }
        return component.getValue()
    },

    /**
     * Find component By ID (compatible with React 16 and subject to change).
     *
     * @param {string} id Component ID.
     * @return {object} Component.
     */
    findComponentById(id) {
        let dom = document.getElementById(id)
        if (!dom) {
            return null
        }
        let key = Object.keys(dom).find(key => key.startsWith("__reactFiber$"))
        let internalInstance = dom[key]
        if (!internalInstance) {
            console.error(`ux.js findComponentById id=${id} value of property whose name starts with __reactFiber$ is null`)
            return null
        }
        let myReturn = internalInstance.return
        if (!myReturn) {
            console.error(`ux.js findComponentById id=${id} internalInstance does not have return`)
            return null
        }
        while (myReturn && !(myReturn.stateNode &&
            myReturn.stateNode && myReturn.stateNode.props &&
            myReturn.stateNode.props.id === id)) {
            myReturn = myReturn.return
        }
        if (!myReturn) {
            console.error(`ux.js findComponentById id=${id} search exhausted unsuccessfully`)
            return null
        }
        if (myReturn.stateNode &&
            myReturn.stateNode.props &&
            myReturn.stateNode.props.id === id) {
            return myReturn.stateNode
        }
        console.error(`ux.js findComponentById id=${id} exited with return but doesn't meet our criteria`)
        return null
    },

    /**
     * Find the VXForm component containing a specified child component.
     *
     * @param {string} id Child component ID.
     * @return {object} Form component.
     */
    findForm(id) {
        let $form = $("#" + id).closest("[role='form']")
        return UX.findComponentById($form.attr("id"))
    },

    /**
     * Find the modal component containing a specified child component.
     *
     * @param {string} id Child component ID.
     * @return {object} Modal component.
     */
    findModal(id) {
        const $modal = $(`#${id}`).closest(".modal")
        return UX.findComponentById($modal.attr("id"))
    },

    /**
     * Find the ID of the modal ID which is parent of the supplied DOM element.
     *
     * @param {object} element DOM element.
     * @return {string} Modal ID.
     */
    findModalId(element) {
        const $modal = $(element).closest(".modal")
        return $modal.attr("id")
    },

    /**
     * Make timezone array for select lists.
     *
     * @return {array} Array of timezones.
     */
    makeTimezoneArray() {
        return Util.makeTimezoneArray()
    },

    /**
     * Make an array of row counts (for pages that restrict results to a certain number of rows).
     *
     * @return {array} Array of log rows for drop-down list.
     */
    makeRowsArray() {
        return [
            { code : "10", localized : "10" },
            { code : "25", localized : "25" },
            { code : "50", localized  : "50" },
            { code : "100", localized : "100" },
            { code : "250", localized : "250" },
            { code : "500", localized : "500" }
        ]
    },

    /**
     * Make event types array.

     * @param {boolean} all True to include ALL value at beginning of array.
     * @return {array} Array of event types.
     */
    makeEventTypesArray(all) {
        let codeArray = []
        _.each(Meteor.i18nMessages.codes.eventType, (object, key) => {
            codeArray.push( { code: key, localized : key } )
        })
        codeArray.sort((eventTypeA, eventTypeB) => {
            if (eventTypeA.code && eventTypeA.code) {
                return Util.safeCompare(eventTypeA.code, eventTypeB.code)
            }
            return 0;
        })
        if (all) {
            codeArray.unshift({ code : "ALL", localized : Util.i18n("events.event_type_all") })
        }
        return codeArray
    },

    /**
     * Make log levels array.
     *
     * @param {boolean} all True to include ALL value at beginning of array.
     * @param {boolean} numericCodes True to indicate that code value should be numeric.
     * @return {array} Array of log levels.
     */
    makeLogLevelsArray(all, numericCodes) {
        let codeArray = []
        codeArray = _.map(Meteor.i18nMessages.codes.logLevel, (value, propertyName) => {
            let code = numericCodes ? propertyName : Meteor.i18nMessages.codes.logLevel[propertyName].code
            let propertyLocalized = Util.i18n("codes.logLevel." + propertyName)
            return { code : code, localized : propertyLocalized }
        })
        if (all) {
            codeArray.unshift({ code : "ALL", localized : Util.i18n("log.option_all")})
        }
        return codeArray
    },

    /**
     * Save all of information that the user has entered into the database.
     *
     * @param {object} form Form to save.
     * @param {function} callback Optional callback.
     * @param {boolean} nomessage True to suppress "saved successfully" message.
     * @param {function} userCallback Optional user callback for extra functions on successful save.
     */
    saveForm(form, callback, nomessage, userCallback) {
        // If the form has a custom update handler, use it:
        if (form.props.updateHandler) {
            form.props.updateHandler((error, result) => {
                UX.saveFormAlertAndCallback(error, result, callback, nomessage, userCallback)
                return
            })
            return
        }
        const modifier = UX.makeModifier(form)
        OLog.debug(`ux.js saveForm update ${form.props.collection._name} _id=${form.props._id} modifier=${OLog.debugString(modifier)}`)
        form.props.collection.update(form.props._id, modifier, (error, result) => {
            let suppressCallback = false
            if (error) {
                UX.saveFormAlertAndCallback(error, result, callback, nomessage, userCallback)
                return
            }
            // Run custom update handlers:
            _.each(form.components, (component) => {
                if (component.props.updateHandler) {
                    UX.updateDatabase(component)
                    return
                }
                if (component.constructor.displayName === "VXImage") {
                    suppressCallback = true
                    UX.updateImage(component)
                    UX.saveFormAlertAndCallback(null, { success : true }, callback, nomessage, userCallback)
                }
            })
            if (!suppressCallback) {
                UX.saveFormAlertAndCallback(null, { success : true }, callback, nomessage, userCallback)
            }
        })
        return
    },

    /**
     * Save form, issue alert and resume with user callback.
     *
     * @param {object} error Error object.
     * @param {object} result Result object.
     * @param {function} callback Callback typically to stop ladda.
     * @param {boolean} nomessage True to suppress message on success.
     * @param {function} callback User-supplied callback for extra functionality.
     */
    saveFormAlertAndCallback(error, result, callback, nomessage, userCallback) {
        Meteor.defer(() => {
            if (error) {
                OLog.error(`ux.js saveFormAlertAndCallback error=${OLog.errorError(error)}`)
                UX.notifyForError(error)
            }
            if (!nomessage) {
                UX.notify({ success : true, icon : "SAVE", key: "common.alert_save_succeeded" })
            }
            if (userCallback) {
                userCallback()
            }
            if (callback) {
                callback(error, result)
            }
        })
    },

    /**
     * Given a form, construct a MongoDB modifier object with $set and $unset
     * operators to update database fields mapped to components
     * in that form.
     *
     * @param {object} form Form object.
     * @returns {object} MongoDB modifier.
     */
    makeModifier(form) {
        let modifier = {}
        _.each(form.components, component => {
            // If a custom update handle has been supplied, don't
            // set the value for this binding (update will happen later):
            if (component.props.updateHandler) {
                return
            }
            // VXImage is handles specially because when changed, the control contains base64-encoded
            // image contents.  This must be uploaded to the cloud, converted to a URL, and that URL
            // must be saved in MongoDB.  This is complex enough such that the process is handled
            // elsewhere:
            if (component.constructor.displayName === "VXImage") {
                return
            }
            UX.mutateModifier(component, modifier)
        })
        return modifier
    },

    /**
     * Update the database.
     *
     * @param {object} component Component.
     */
    updateDatabase(component) {
        if (component.props.updateHandler) {
            let value = component.getValue()
            component.props.updateHandler.call(this, component, value)
            return
        }
        const formProps = UX.getFormProps(component)
        if (formProps.updateHandler) {
            const value = component.getValue()
            formProps.updateHandler.call(this, component, value)
            return
        }
        const modifier = {}
        UX.mutateModifier(component, modifier)
        OLog.debug(`ux.js updateDatabase dynamic update ${formProps.collection._name} _id=${formProps._id} ` +
            `modifier=${OLog.debugString(modifier)}`)
        formProps.collection.update(formProps._id, modifier, error => {
            if (error) {
                OLog.error("ux.js updateDatabase error returned from dynamic field update=" + error)
                UX.notifyForDatabaseError(error)
                return
            }
            OLog.debug("ux.js updateDatabase *success*")
        })
    },

    /**
     * Mutate a modifier defering to modification handler if applicable..
     *
     * @param {object} component Component with value to be considered.
     * @param {object} modifier Modifier to be mutated place.
     */
    mutateModifier(component, modifier) {
        if (component.props.modifyHandler) {
            component.props.modifyHandler(component, modifier)
            return
        }
        UX.mutateModifierTraditional(component, modifier)
    },

    /**
     * Mutate a modifier in the traditional way.
     *
     * @param {object} component Component with value to be considered.
     * @param {object} modifier Modifier to be mutated place.
     */
    mutateModifierTraditional(component, modifier) {
        let value = component.getValue()
        let dbName = component.props.dbName || component.props.id
        if (Util.isNullish(value)) {
            modifier.$unset = modifier.$unset || {}
            modifier.$unset[dbName] = ""
            return
        }
        modifier.$set = modifier.$set || {}
        modifier.$set[dbName] = value
    },

    /**
     * Given an instance of VXImage, push a photo in DataURL format to the storage provd and update MongoDB
     * with the image URL. When adding a new image, transform the DataURL into an actual URL, seamlessly
     * "pointing" the thumbnail image at the uploaded image.
     *
     * @param {object} component Instance of VXImage.
     */
    updateImage(component) {
        const dbName = component.props.dbName || component.props.id
        const content = component.getValue()
        const formProps = UX.getFormProps(component)
        if (!content) {
            OLog.debug("ux.js updateImage new content is not specified, image will be removed")
            UX.updateImageUrl(formProps.collection, formProps._id, dbName, null)
            UX.fixHolder()
            return
        }
        if (Util.isHttpUrl(content)) {
            OLog.debug(`ux.js updateImage HTTP URL content detected, no further action will be taken, content=${content}`)
            return
        }
        if (Util.isDataUrl(content)) {
            OLog.debug(`ux.js updateImage Data URL content detected, continuing content length=${content.length}`)
            const imagePath = Util.makeImagePath(component.props.imageType, content)
            const url = `${CX.CLOUDFILES_PREFIX}/${imagePath}`
            OLog.debug(`ux.js updateImage data URL detected collection=${formProps.collection._name} ` +
                `_id=${formProps._id} url=${url}`)
            Meteor.call("putImage", imagePath, content, error => {
                if (error) {
                    OLog.error(`ux.js updateImage collection=${formProps.collection._name} ` +
                        `_id=${formProps._id} url=${url} error=${OLog.errorError(error)}`)
                    return
                }
                UX.updateImageUrl(formProps.collection, formProps._id, dbName, url)
                component.setValue(url)
                return
            })
        }
    },

    /**
     * Update an image URL in MongoDB.
     *
     * @param {object} collection Collection to update.
     * @param {string} _id MongoDB record ID.
     * @param {string} dbName Database field name.
     * @param {string} url Image URL.
     */
    updateImageUrl(collection, _id, dbName, url) {
        const modifier = {}
        if (url) {
            modifier.$set = {}
            modifier.$set[dbName] = url
        }
        else {
            modifier.$unset = {}
            modifier.$unset[dbName] = null
        }
        OLog.debug(`ux.js updateImageUrl ${collection._name} _id=${_id} modifier=${OLog.debugString(modifier)}`)
        collection.update(_id, modifier, error => {
            if (error) {
                OLog.error(`ux.js updateImageUrl MongoDB update error=${OLog.errorError(error)}`)
                return
            }
        })
    },

    /**
     * Update the redux store with form data.
     *
     * @param {object} component Component.
     */
    updateRedux(component) {
        let formProps = UX.getFormProps(component)
        let value = component.getValue()
        let dbName = component.props.dbName || component.props.id
        OLog.debug("ux.js updateRedux formId=" + formProps.id + " dbName=" + dbName)
        let formData = Store.getState().formData
        let currentFormValues = formData[formProps.id] || {}
        currentFormValues[dbName] = value
        formData[formProps.id] = currentFormValues
        Store.dispatch(setFormData(formData))
    },

    /**
     * Clone an object (data) omitting certain properties.
     *
     * @param {object} data Data object to be cloned.
     * @param {array} keys Keys of properties to be omitted.
     */
    omit(data, keys) {
        let result = {}
        Object.keys(data).forEach((key) => {
            if (keys.indexOf(key) === -1) {
                result[key] = data[key]
            }
        })
        return result
    },

    /**
     * Reset a form.
     *
     * @param {object} form Form to reset.
     */
    resetForm(form) {
        form.reset()
        for (let component of form.components) {
            component.reset()
        }
    },

    /**
     * Clear a form.
     *
     * @param {object} form Form to reset.
     */
    clearForm(form) {
        for (let component of form.components) {
            component.setValue(null)
        }
    },

    /**
     * Convenience method for saving when using a form footer.
     *
     * @param {object} form Form to be saved.
     * @param {object} laddaCallback Callback to stop save ladda.
     * @param {boolean} nomessage True to suppress "saved successfully" message.
     * @param {function} userCallback Optional callback to invoke on successful save.
     */
    save(form, laddaCallback, nomessage, userCallback) {
        if (!UX.checkForm(form)) {
            laddaCallback(false)
            return
        }
        UX.saveForm(form, laddaCallback, nomessage, userCallback)
    },

    /**
     * Perform a major push, that is, handle the selection of an entity that results in a route change.
     *
     * @param {string} majorLabel i18n bundle key of major (route-level) back label.
     * @param {string} minorLabel i18n bundle key of minor (panel-level) back label.
     * @param {string} path Path (suitable for UX.go function).
     * @param {string} panel Panel name (i.e., LEFT, RIGHT or BOTH).
     * @param {string} animation Optional animation name.
     */
    iosMajorPush(majorLabel, minorLabel, path, panel, animation) {
        // Yield to let UI complete animations before transitions:
        Meteor.setTimeout(() => {
            animation = animation || "slideleft"
            let iosState = { ...Store.getState().iosState }
            let state = {}
            state.major = true
            state.majorLabel = iosState.majorBackLabel
            state.minorLabel = iosState.minorBackLabel
            state.path = Util.routePath()
            state.panel = UX.getCurrentPanel(Util.routePath())
            OLog.debug(`ux.js iosMajorPush *push* old state=${OLog.debugString(state)}`)
            iosState.stack = iosState.stack || []
            iosState.stack.push(state)
            UX.lockExitingComponents(true)
            iosState.majorBackLabel = majorLabel
            iosState.minorBackLabel = minorLabel
            UX.beforeAnimate()
            UX.setAnimation("vx-layout-standard", animation)
            UX.mutatePanelMap(iosState, path, panel)
            OLog.debug(`ux.js iosMajorPush new iosState=${OLog.debugString(iosState)}`)
            Store.dispatch(setIosState(iosState))
            UX.go(path)
        })
    },

    /**
     * Perform a minor push, that is, handle the selection of an entity where the route remains
     * unchanged (only the panel changes).
     *
     * @param {string} minorLabel i18n bundle key minor (panel-level) back label.
     * @param {string} panel Panel name (i.e., RIGHT).
     * @param {string} animation Optional animation name.
     */
    iosMinorPush(minorLabel, panel, animation) {
        if (!UX.isSlideMode()) {
            return
        }
        // Yield to let UI complete animations before transitions:
        Meteor.setTimeout(() => {
            animation = animation || "slideleft"
            let iosState = { ...Store.getState().iosState }
            let state = {}
            state.major = false
            state.majorLabel = iosState.majorBackLabel
            state.minorLabel = iosState.minorBackLabel
            state.path = Util.routePath()
            state.panel = UX.getCurrentPanel(Util.routePath())
            OLog.debug(`ux.js iosMinorPush *push* old state=${OLog.debugString(state)}`)
            iosState.stack = iosState.stack || []
            iosState.stack.push(state)
            UX.lockExitingComponents(true)
            iosState.minorBackLabel = minorLabel
            UX.setAnimation("vx-slide-pair", animation)
            UX.beforeAnimate()
            UX.mutatePanelMap(iosState, Util.routePath(), panel)
            OLog.debug(`ux.js iosMinorPush new iosState=${OLog.debugString(iosState)}`)
            Store.dispatch(setIosState(iosState))
        })
    },

    /**
     * Pop the iOS button stack, and set the new state accordingly. If we're at the top of the stack, we'll
     * programmatically trigger the standard back function.
     *
     * @param {string} animation Optional animation name.
     */
    iosPopAndGo(animation) {
        animation = animation || "slideright"
        const path = Util.routePath()
        const iosState = { ...Store.getState().iosState }
        if (!iosState.stack || iosState.stack.length === 0) {
            OLog.error("ux.js iosPopAndGo stack length is zero, cannot pop")
            UX.goDefault()
            return
        }
        let state
        if (UX.isSlideMode()) {
            state = iosState.stack.pop()
        }
        else {
            do {
                state = iosState.stack.pop()
            }
            while (state && !state.major)
        }
        if (!state) {
            OLog.error("ux.js iosPopAndGo pop executed but no previous state exists on stack going to default route")
            UX.goDefault()
            return
        }
        OLog.debug(`ux.js iosPopAndGo stack *pop* new state=${OLog.debugString(state)}`)
        Meteor.setTimeout(() => {
            try {
                UX.lockExitingComponents(true)
                iosState.majorBackLabel = state.majorLabel
                iosState.minorBackLabel = state.minorLabel
                UX.beforeAnimate()
                if (state.major) {
                    UX.setAnimation("vx-layout-standard", animation)
                }
                else {
                    UX.setAnimation("vx-slide-pair", animation)
                }
                UX.mutatePanelMap(iosState, state.path, state.panel)
                Store.dispatch(setIosState(iosState))
                if (path === state.path) {
                    OLog.debug(`ux.js iosPopAndGo original path=${path} state.path=${state.path} *same* stay on this route`)
                    return
                }
                OLog.debug(`ux.js iosPopAndGo original path=${path} state.path=${state.path} *different* go ${state.path}`)
                Meteor.setTimeout(() => {
                    UX.go(state.path)
                })
            }
            catch (error) {
                OLog.debug(`ux.js iosPopAndGo error=${error}`)
            }
        })
    },

    /**
     * Go to a new route with an effect like iosMajorPush without affecting the stack.
     *
     * @param {string} majorLabel i18n bundle key of major (route-level) back label.
     * @param {string} minorLabel i18n bundle key of minor (panel-level) back label.
     * @param {string} path Path (suitable for UX.go function).
     * @param {string} panel Panel name to display (i.e., LEFT, RIGHT, BOTH).
     * @param {string} animation Optional animation name.
     */
    iosInvoke(majorLabel, minorLabel, path, panel, animation) {
        const $activeElement = $(document.activeElement)
        UX.stopEditing($activeElement, true)
        Meteor.setTimeout(() => {
            animation = animation || "crossfade"
            let iosState = { ...Store.getState().iosState }
            OLog.debug(`ux.js iosInvoke path=${path} animation=${animation}`)
            UX.lockExitingComponents(true)
            UX.beforeAnimate()
            UX.setAnimation("vx-layout-standard", animation)
            iosState.majorBackLabel = majorLabel
            iosState.minorBackLabel = minorLabel
            UX.mutatePanelMap(iosState, path, panel)
            Store.dispatch(setIosState(iosState))
            UX.go(path)
        })
    },

    /**
     * Lock any components bearing class lock-exiting-component.
     *
     * @param {boolean} locked True to lock, false to unlock.
     */
    lockExitingComponents(locked) {
        $(".lock-exiting-component").each((index, element) => {
            const id = $(element).attr("id")
            if (!id) {
                OLog.error(`ux.js lockExitingComponents element does not have attribute id element=${$(element).html()}`)
                return
            }
            const component = UX.findComponentById(id)
            if (!component) {
                OLog.error(`ux.js lockExitingComponents element id=${id} is not a React component`)
                return
            }
            if (!component.setLocked) {
                OLog.error(`ux.js lockExitingComponents element id=${id} component does not expose setLocked method`)
                return
            }
            component.setLocked(locked)
            OLog.debug(`ux.js lockExitingComponents element id=${id} component *locked*`)
        })
    },

    /**
     * Perform before-animate steps.
     */
    beforeAnimate() {
        // Nothing universal yet
    },

    /**
     * Wrap up after animation is completed.
     */
    afterAnimate() {
        UX.setAnimation("vx-layout-standard", null)
    },

    /**
     * Initialize stack and back labels, initializing for a new route or
     * possibly resetting state after unexpected condition.
     *
     * @param {string} routePath Path to route coming up next.
     */
    initStackAndBackLabels(routePath) {
        const iosState = { ...Store.getState().iosState }
        iosState.stack = []
        iosState.majorBackLabel = null
        iosState.minorBackLabel = null
        UX.mutatePanelMap(iosState, routePath, VXApp.getInitialPanel(routePath))
        Store.dispatch(setIosState(iosState))
    },

    /**
     * Register a component with its respective form.
     *
     * @param {object} component Component to register.
     */
    register(component) {
        UX.invokeFormFunction("register", component)
    },

    /**
     * Unregister a component with its respective form.
     *
     * @param {object} component Component to unregister.
     */
    unregister(component) {
        UX.invokeFormFunction("unregister", component)
    },

    /**
     * Add a component to the list of errors in a form.
     *
     * @param {object} component Component to be added to form error list.
     */
    addError(component) {
        UX.invokeFormFunction("addError", component)
    },

    /**
     * Remove a component from the list of errors in a form.
     *
     * @param {object} component Component to be removed from form error list.
     */
    deleteError(component) {
        UX.invokeFormFunction("deleteError", component)
    },

    /**
     * Invoke form function generically.
     *
     * @param {string} name Name of function to be invoked.
     * @param {component} component Component in question.
     */
    invokeFormFunction(name, component) {
        let form = UX.findForm(component.props.id)
        if (!form) {
            //OLog.error(`ux.js invokeFormFunction unable to find form of component id=${component.props.id}`)
            return
        }
        form[name](component)
    },

    /**
     * Return the properties of the form associated with a given component.
     *
     * @param {object} component Component whose properties are to be returned.
     * @return {object} Form properties.
     */
    getFormProps(component) {
        let form = UX.findForm(component.props.id)
        if (!form) {
            //OLog.error("ux.js getFormProps unable to find form of component id=" + component.props.id)
            return
        }
        return form.props
    },

    /**
     * Determine whether a given component is within a dynamic form.
     *
     * @param {object} component Component to be evaluated.
     * @return {boolean} True if component resides within a dynamic form.
     */
    isFormDynamic(component) {
        let formProps = UX.getFormProps(component)
        if (!formProps) {
            //OLog.error("ux.js isFormDynamic unable to find form of component id=" + component.props.id)
            return false
        }
        return formProps.dynamic
    },

    /**
     * Determine whether a given component (within a form) should receive property updates
     * via UNSAFE_componentWillReceiveProps.
     *
     * @param {object} component Component to be evaluated.
     * @return {boolean} True if component should receive props.
     */
    isFormReceiveProps(component) {
        let formProps = UX.getFormProps(component)
        if (!formProps) {
            //OLog.error("ux.js isFormReceiveProps unable to find form of component id=" + component.props.id)
            return true
        }
        return formProps.receiveProps
    },

    /**
     * Determine whether a given component (within a form) should automatically
     * update the redux store.
     *
     * @param {object} component Component to be evaluated.
     * @return {boolean} True if component should receive props.
     */
    isFormRedux(component) {
        let formProps = UX.getFormProps(component)
        if (!formProps) {
            OLog.error("ux.js isFormRedux unable to find form of component id=" + component.props.id)
            return false
        }
        return formProps.redux
    },

    /**
     * Add a blank selection to the beginning of a code array.
     *
     * @param {array} codeArray Traditional code array.
     * @return {array} New array with blank value added to beginning
     */
    addBlankSelection(codeArray) {
        return UX.addSelection(codeArray, "", "")
    },

    /**
     * Add an "All" selection to the beginning of a code array.
     *
     * @param {array} codeArray Traditional code array.
     * @return {array} New array with "All" value added to beginning
     */
    addAllSelection(codeArray) {
        return UX.addSelection(codeArray, "ALL", Util.i18n("common.label_all"))
    },

    /**
     * Add a specified selection to the top of a code array.
     *
     * @param {array} codeArray Traditional code array.
     * @param {string} code Code to add.
     * @param {string} localized Localization to add.
     * @return {array} New array with special selection added to top.
     */
    addSelection(codeArray, code, localized) {
        const newArray = codeArray ? codeArray.slice() : []
        newArray.unshift( { code, localized } )
        return newArray
    },

    /**
     * Given a value and a code array, if the value is null, select the
     * first value from the code array.  This allows us to set the state
     * of VXSelect controls to behave as they do when no value is selected.
     *
     * @param {string} value Value to test.
     * @param {array} codeArray Standard code array.
     * @return {string} Supplied value or first value in code array.
     */
    chooseFirstIfBlank(value, codeArray) {
        if (value) {
            return value
        }
        return codeArray[0].code
    },

    /**
     * Show a modal by mounting and rendering it into a specified anchor element.
     *
     * @param {object} element React element representing modal to be shown.
     * @param {object} anchorSelector Optional anchor jQuery selector.
     */
    showModal(element, anchorSelector) {
        if (!React.isValidElement(element)) {
            OLog.error("ux.js showModal supplied element is not a React element")
            return
        }
        UX.mountModal(element, anchorSelector)
    },

    /**
     * Dismiss a modal.
     *
     * @param {string} modalId Modal ID to be dismissed.
     */
    dismissModal(modalId) {
        OLog.debug(`ux.js dismissModal dismissing modal modalId=${modalId}`)
        $(`#${modalId}`).modal("hide")
        $(`#${modalId}`).one("hidden.bs.modal", () => {
            const modalComponent = UX.findComponentById(modalId)
            if (modalComponent) {
                UX.unmountModal(modalComponent.props.anchorSelector)
            }
        })
    },

    /**
     * Clear any active modals.
     */
    clearModal() {
        if ($("body").hasClass("modal-open")) {
            // Ensure animation has time to finish:
            Meteor.setTimeout(() => {
                $(".modal").each(() => {
                    const modalId = $(this).attr("id")
                    UX.dismissModal(modalId)
                })
                $("body").removeClass("modal-open")
                $(".modal-backdrop").remove()
            }, 1000)
        }
    },

    /**
     * Mount a React modal by rendering it into a pre-defined anchor element.
     *
     * @param {object} element React component definition.
     * @param {object} anchorSelector Anchor jQuery selector.
     * @return {object} React component instantiated.
     */
    mountModal(element, anchorSelector) {
        anchorSelector = anchorSelector || "#vx-anchor"
        const anchorId = anchorSelector.substr(1)
        const modalCount = $(anchorSelector).children().length + 1
        const modalContainerId = `${anchorId}-${modalCount}`
        const id = `${element.props.id}-${modalCount}`
        $(anchorSelector).append(`<div id="${modalContainerId}"></div>`)
        const clonedElement = React.cloneElement(element, { id, anchorSelector })
        OLog.debug(`ux.js mountModal id=${clonedElement.props.id} anchorSelector=${anchorSelector}`)
        const $containerElement = $(`#${modalContainerId}`)
        if (!$containerElement.exists()) {
            OLog.error(`ux.js mountModal unable to mount modal container not found modalContainerId=${modalContainerId}`)
            return
        }
        UXState[modalContainerId] = createRoot($containerElement[0])
        return UXState[modalContainerId].render(clonedElement)
    },

    /**
     * Unmount a React modal that is contained within a specified anchor element.
     *
     * @param {object} anchorSelector Anchor jQuery selector.
     */
    unmountModal(anchorSelector) {
        anchorSelector = anchorSelector || "#vx-anchor"
        const anchorId = anchorSelector.substr(1)
        const modalCount = $(anchorSelector).children().length
        const modalContainerId = `${anchorId}-${modalCount}`
        UXState[modalContainerId].unmount() // ($(`#${modalContainerId}`)[0])
        $(`#${modalContainerId}`).remove()
        OLog.debug(`ux.js unmountModal modalContainerId=${modalContainerId} unmounted and removed`)
    },

    /**
     * Augment React children by recursively cloning and adding new properties.
     *
     * @param {array} children Array of children.
     * @param {function} predicate Predicate to test child for eligibility.
     * @param {object} properties Properties to be added to eligible child.
     * @return {array} Cloned children bearing new properties.
     */
    augmentChildren(children, predicate, properties) {
        let newChildren = React.Children.map(children, child => {
            if (UX.isDOMTypeElement(child)) {
                return child
            }
            if (predicate(child)) {
                child = React.cloneElement(child, properties)
            }
            if (child.props.children) {
                let newChildren = UX.augmentChildren(child.props.children, predicate, properties)
                child = React.cloneElement(child, { children : newChildren })
            }
            return child
        })
        return newChildren
    },

    /**
     * Given a form, construct a JSON object consisting of all of the
     * component values where the name is the dbName and the value is the value.
     *
     * @param {object} form Form object.
     * @returns {object} Form object.
     */
    makeFormObject(form) {
        let formObject = {}
        _.each(form.components, component => {
            let dbName = component.props.dbName || component.props.id
            let value = component.getValue()
            if (!Util.isNullish(value)) {
                formObject[dbName] = value
            }
        })
        return formObject
    },

    /**
     * Parse React children to convert any embedded HTML strings into
     * React elements.
     *
     * @param {?} children React children string or array.
     * @return {?} String or array.
     */
    parseHtml(children) {
        return _.isString(children) ? Parser(children) : children
    },

    /**
     * Register a caller-supplied delegate function for a specified iOS button.
     *
     * @param {string} componentId Component ID.
     * @param {function} delegate Delegate function.
     * @param {string} iconClass Icon class.
     * @param {string} iconStyle Icon style.
     * @param {string} title Title (tooltip).
     * @param {position} position Button position (i.e., left, center, right}
     * @param {boolean} showLoading True to enable loading indicator for iOS button.
     * @param {number} minimumDuration Minimum duration in milliseconds for loading indicator.
     */
    registerIosButtonDelegate(componentId, delegate, iconClass, iconStyle, title, position,
        showLoading, minimumDuration) {
        UXState[componentId] = delegate
        const iosState = { ...Store.getState().iosState }
        iosState.iosButtonState = iosState.iosButtonState || {}
        const defaultButtonState = iosState.iosButtonState[componentId] || CX.IOS_BUTTON_DEFAULTS[componentId] || {}
        iosState.iosButtonState[componentId] = { ...defaultButtonState,
            ...iconClass && { iconClass },
            ...iconStyle && { iconStyle },
            ...title && { title },
            ...position && { position },
            ...showLoading && { showLoading },
            ...minimumDuration && { minimumDuration }
        }
        Store.dispatch(setIosState(iosState))
    },

    /**
     * Unregister a delegate function.
     *
     * @param {string} componentId Component ID.
     */
    unregisterIosButtonDelegate(componentId) {
        //OLog.debug(`ux.js unregisterIosButtonDelegate componentId=${componentId}`)
        delete UXState[componentId]
        const iosState = { ...Store.getState().iosState }
        delete iosState.iosButtonState?.[componentId]
        Store.dispatch(setIosState(iosState))
    },

    /**
     * Unregister all delegate functions (note plural).
     */
    unregisterIosButtonDelegates() {
        //OLog.debug("ux.js unregisterIosButtonDelegates *purging*")
        const iosState = { ...Store.getState().iosState }
        delete iosState.iosButtonState
        Store.dispatch(setIosState(iosState))
        Object.keys(UXState).forEach(componentId => {
            if (componentId.startsWith("ios-button")) {
                delete UXState[componentId]
            }
        })
    },

    /**
     * Lock or unlock a specified component.
     *
     * @param {array} componentIdArray Array of component IDs.
     * @param {boolean} lock True to lock.
     */
    setLocked(componentIdArray, locked) {
        _.each(componentIdArray, componentId => {
            let component = UX.findComponentById(componentId)
            if (!component) {
                OLog.debug("ux.js setLocked unable to find componentId=" + componentId + " it may not exist")
                return
            }
            OLog.debug("ux.js setLocked componentId=" + componentId + " locked=" + locked)
            component.setLocked(locked)
        })
    },

    /**
     * Convert returns to HTML line breaks (<br/>).
     *
     * @param {string} html String with returns.
     * @return {string} String with returns converted to <br>.
     */
    convertReturnsToBreaks(input) {
        if (!input) {
            return input
        }
        return input.replace(/\n/g, "<br/>")
    },

    /**
     * Return the default expand-in class.
     *
     * @return {string} Expand-in class for new collapse sections.
     */
    expandInClass() {
        return UX.isPhone() ? "" : " in"
    },

    /**
     * Return the default expand-chevron class.
     *
     * @return {string} Expand-chevron class for new collapse sections.
     */
    expandChevronClass() {
        return UX.isPhone() ? "fa-chevron-down" : "fa-chevron-up"
    },

    /**
     * Get the last segment of the current route path. This is typically a MongoID or token.
     *
     * @return {string} Last segment of route path.
     */
    lastSegment() {
        const parts = Util.routePath().split("/")
        return parts.pop()
    },

    /**
     * Get the first segment of the current route path. This is the route path without token.
     *
     * @return {string} First segment of route path.
     */
    firstSegment() {
        const routePath = Util.routePath()
        const index = routePath.lastIndexOf("/")
        return index === 0 ? routePath : routePath.substring(0, index + 1)
    },

    /**
     * Go to the default page for this user.
     */
    goDefault() {
        Meteor.call("getDefaultRoute", (error, defaultRoute) => {
            OLog.debug(`ux.js getDefaultRoute server has inferred that default route for ${Util.getUserEmail(Meteor.userId())} ` +
                `should be ${defaultRoute}`)
            UX.initStackAndBackLabels(defaultRoute)
            UX.go(defaultRoute)
        })
    },

    /**
     * Nav menu on click menu item.
     *
     * @param {object} event Event.
     */
    onClickMenuItem(event) {
        event.preventDefault()
        let $element = $(event.target).closest(".navmenu-delay")
        if (!$element.exists()) {
            OLog.error("ux.js onClickMenuItem unable to find target for event")
            return
        }
        let href = $element.data("navmenu-href")
        if (!href) {
            OLog.error("ux.js onClickMenuItem unable to find data-navmenu-href")
            return
        }
        OLog.debug("ux.js onClickMenuItem cue delayed route=" + href)
        $("#offcanvas-menu-react").one("animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd", () => {
            $("#offcanvas-menu-react").off("animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd")
            UX.resetNav()
            OLog.debug("ux.js onClickMenuItem delayed route *fire* route=" + href)
            if (Util.routePath() === href) {
                OLog.debug("ux.js onClickMenuItem old " + Util.routePath() + " is identical to new route " + href)
            }
            else {
                OLog.debug("ux.js onClickMenuItem old " + Util.routePath() + " is different from new route " + href + " so show loading spinner")
                UX.showLoading()
            }
            Meteor.defer(() => {
                UX.initStackAndBackLabels(href)
                UX.go(href)
            })
        })
        UX.toggleNav()
    },

    /**
     * Nav menu on close event handler.
     *
     * @param {object} event Event.
     */
    onClickCloseMenu(event) {
        OLog.debug(`ux.js onClickCloseMenu user=${Util.getUserEmail()}`)
        event.preventDefault()
        UX.toggleNav()
    },

    /**
     * Nav menu on click deployment.
     *
     * @param {object} event Event.
     * @param {object} modal Deployment modal.
     */
    onClickDeployment(event, modal) {
        OLog.debug(`ux.js onClickDeployment user=${Util.getUserEmail()}`)
        event.preventDefault()
        Meteor.setTimeout(() => {
            UX.showModal(modal)
        }, 500)
    },

    /**
     * Nav menu on click about.
     *
     * @param {object} event Event.
     * @param {object} modal About Modal.
     */
    onClickAbout(event, modal) {
        OLog.debug(`ux.js onClickAbout user=${Util.getUserEmail()}`)
        event.preventDefault()
        Meteor.setTimeout(() => {
            UX.showModal(modal)
        }, 300)
        UX.toggleNav()
    },

    /**
     * Nav menu on click sign out.
     *
     * @param {object} event Event.
     */
    onClickSignOut(event) {
        OLog.debug("ux.js onClickSignOut clicked, user=" + Util.getUserEmail())
        event.preventDefault()
        $("#offcanvas-menu-react").one("animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd", () => {
            $("#offcanvas-menu-react").off("animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd")
            UX.showLoading()
            UX.resetNav()
            OLog.debug("ux.js onClickSignOut user=" + Util.getUserEmail(Meteor.userId()))
            VXApp.logout(() => {
                UX.clearLoading()
            })
        })
        UX.toggleNav()
    },

    /**
     * Invoke Meteor call returning promise.
     *
     * @param {string} method Method name.
     * @param {?} parameters Parameters.
     * @return {object} Promise representing Meteor method call.
     */
    async call(method, ...parameters) {
        return new Promise((resolve, reject) => {
            OLog.debug(`ux.js call *executor* invoking ${method}`)
            Meteor.call(method, ...parameters, (error, result) => {
                if (error) {
                    OLog.error(`ux.js call method ${method} *reject* error=${OLog.errorError(error)}`)
                    reject(error)
                    return
                }
                OLog.debug(`ux.js call method ${method} *resolve*`)
                resolve(result)
            })
        })
    },

    /**
     * Invoke HTTP call returning promise.
     *
     * @param {string} method Method (e.g., GET or POST).
     * @param {string} url URL to retrieve.
     * @param {object} options Optional options.
     * @return {object} Promise representing HTTP request.
     */
    async http(method, url, options) {
        return await UX.call("http", method, url, options)
    },

    /**
     * For React debugging, compare two objects and find differences between them.
     * This can be used on either properties or state objects.
     *
     * @param {object} oldObject Old object.
     * @param {object} newObject New object.
     * @param {string} keyCheck Key to check more carefully.
     */
    showDifferences(oldObject, newObject, keyCheck) {
        if (!(oldObject && newObject)) {
            console.log(`ux.js showDifferences oldObject=${oldObject} newObject=${newObject}`)
            return
        }
        Object.keys(oldObject).forEach(key => {
            const oldProp = oldObject[key]
            const newProp = newObject[key]
            if (!isEqual(oldProp, newProp)) {
                console.log(`ux.js showDifferences key=${key}`)
                if (key === keyCheck) {
                    console.log(`ux.js showDifferences key=${key} oldProp=${JSON.stringify(oldProp)} newProp=${JSON.stringify(newProp)}`)
                }
            }
        })
    },

    /**
     * Format a given date in a specified format.
     *
     * @param {date} date Date to format.
     * @param {string} format Moment-style format (e.g., MM/DD/YYYY)
     * @param {?} userOrId User object or user ID.
     * @param {string} timezone Timezone.
     * @return {string} Formatted date.
     */
    formatDate(date, format, userOrId, timezone) {
        if (!date) {
            return null
        }
        if (!timezone) {
            userOrId = userOrId || Meteor.userId()
            if (!userOrId) {
                return null
            }
            const user = Util.user(userOrId)
            if (!user) {
                OLog.error(`ux.js formatDate unable to locate userOrId=${userOrId}`)
                return
            }
            timezone = Util.getUserTimezone(user._id)
        }
        return Util.formatDate(date, timezone, format)
    },

    /**
     * Create pop-over for a field in error.
     *
     * @param {string} popoverContainer Popover container selector (e.g., "body", ".right-body").
     * @param {object} $element Element to be decorated with popover.
     * @param {string} localized message for pop-over.
     * @param {string} popoverPlacement Placement relative to element (defaults to bottom).
     */
    createPopover(popoverContainer, $element, localizedMessage, popoverPlacement) {
        popoverContainer = popoverContainer || false
        popoverPlacement = popoverPlacement || "bottom"
        $element.popover({
            content: localizedMessage,
            trigger: "manual",
            container: popoverContainer,
            placement: popoverPlacement
        });
        $element.popover("show")
        $element.addClass("ux-popover-shown")
    },

    /**
     * Clear a popover.
     *
     * @param {object} element Element to be clearned of popover.
     */
    clearPopover($element) {
        if (!$element.exists()) {
            return
        }
        $element.popover("destroy")
    },

    /**
     * Given an anchor clicked event and a web page URL, open that web page
     * in a new tab.
     *
     * @param {string} url URL of page including protocol http or https.
     * @param {object} event Event allowing system to prevent default behavior.
     */
    openWebPage(url, event) {
        event.preventDefault()
        window.open(url, "_blank");
    },

    /**
     * Determine if a supplied parameter is a Class component.
     *
     * @param {?} component Parameter to test.
     * @return {boolean} True if the parameter is a Class component.
     */
    isClassComponent(component) {
        return (
            typeof component === "function" &&
            !!component.prototype.isReactComponent
        )
    },

    /**
     * Determine if a supplied parameter is a Function component.
     *
     * @param {?} component Parameter to test.
     * @return {boolean} True if the parameter is a Function component.
     */
    isFunctionComponent(component) {
        return (
            typeof component === "function" &&
            String(component).includes("return React.createElement")
        )
    },

    /**
     * Determine if a supplied parameter is a React component.
     *
     * @param {?} component Parameter to test.
     * @return {boolean} True if the parameter is a React component.
     */
    isReactComponent(component) {
        return (
            UX.isClassComponent(component) ||
            UX.isFunctionComponent(component)
        )
    },

    /**
     * Determine if a supplied parameter is a React element.
     *
     * @param {?} component Parameter to test.
     * @return {boolean} True if the parameter is a React element.
     */
    isElement(element) {
        return React.isValidElement(element)
    },

    /**
     * Determine if a supplied parameter is a DOM element.
     *
     * @param {?} component Parameter to test.
     * @return {boolean} True if the parameter is a DOM element.
     */
    isDOMTypeElement(element) {
        return UX.isElement(element) && typeof element.type === "string"
    },

    /**
     * Determine if a supplied parameter is a composite element.
     *
     * @param {?} component Parameter to test.
     * @return {boolean} True if the parameter is a composite element.
     */
    isCompositeTypeElement(element) {
        return UX.isElement(element) && typeof element.type === "function"
    },

    /**
     * Convert a redux-stored (potentially rehydrated) date back to the correct form
     * for VXDate.
     *
     * @param {?} dateString Date string or date.
     * @return {object} JavaScript date object.
     */
    reduxDate(dateString) {
        if (!dateString) {
            return dateString
        }
        return moment.tz(dateString, Util.getUserTimezone()).toDate()
    },

    /**
     * Get from local storage with automatic expiration.
     *
     * @param {string} key Local storage key.
     */
    getLocalStorageWithExpiry(key) {
        const itemString = localStorage.getItem(key)
        if (!itemString) {
            return null
        }
        const itemObject = JSON.parse(itemString)
        const nowDate = new Date()
        if (nowDate.getTime() > itemObject.expiry) {
            localStorage.removeItem(key)
            return null
        }
        return itemObject.value
    },

    /**
     * Set local storage with TTL.
     *
     * @param {string} key Local storage key.
     * @param {string} value Value to set.
     * @param {number} ttl Time-to-live in milliseconds.
     */
    setLocalStorageWithExpiry(key, value, ttl) {
	    const expiry = new Date().getTime() + ttl
    	localStorage.setItem(key, JSON.stringify({ value, expiry }))
    },

    /**
     * Remove from local storage (helper here for symmetry).
     *
     * @param {string} key Local storage key.
     */
    removeLocalStorageWithExpiry(key) {
    	localStorage.removeItem(key)
    },

    /**
     * Scroll to the bottom of the specified element.
     *
     * @param {object} $element jQuery element to scroll.
     */
    scrollToBottom($element) {
        Meteor.setTimeout(() => {
            $element.scrollTop($element[0].scrollHeight)
        }, 100)
    },

    /**
     * Find dupliate HTML IDs and dump them to console.
     */
    dumpDuplicateIds() {
        const idArray = [...document.querySelectorAll("[id]")].map((x) => x.id)
        const idToCount = idArray.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1
            return acc
        }, {})
        // console.log("ux.js dumpDuplicateIds idToCount", idToCount)
        const duplicates = Object.entries(idToCount).filter(idObject => {
            return idObject.value > 1
        })
        console.log("ux.js dumpDuplicateIds duplicates", duplicates)
    },
}
