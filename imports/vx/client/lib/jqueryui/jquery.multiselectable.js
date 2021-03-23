/**
 * Author: Ethan Atlakson, Jay Hayes, Gabriel Such, Alexander Shvets
 * Last Revision 3/16/2012
 * multi-selectable
 *
 * 2/28/2021 - DL - Significant refactoring
 */
$.fn.multiselectable = function(options) {
    if (!options) {
        options = {}
    }
    options = $.extend({}, $.fn.multiselectable.defaults, options)

    function mouseDown(e) {
        if (e.button !== 0) {
            return
        }
        const item = $(this)
        const parent = item.parent()
        if (options.multi) {
            mouseDownMulti(e, item, parent)
        }
        else {
            mouseDownSingle(item, parent)
        }
    }

    function mouseDownMulti(e, item, parent) {
        const myIndex = item.index()
        let prev = parent.find(".multiselectable-previous")
        // If no previous selection found, start selecting from first selected item.
        prev = prev.length ? prev : $(parent.find("." + options.selectedClass)[0]).addClass("multiselectable-previous")

        const prevIndex = prev.index()

        if (e.ctrlKey || e.metaKey) {
            if (item.hasClass(options.selectedClass)) {
                item.removeClass(options.selectedClass).removeClass("multiselectable-previous")
                if (item.not(".child").length) {
                    item.nextUntil(":not(.child)").removeClass(options.selectedClass)
                }
            }
            else {
                parent.find(".multiselectable-previous").removeClass("multiselectable-previous")
                item.addClass(options.selectedClass).addClass("multiselectable-previous")
                if (item.not(".child").length) {
                    item.nextUntil(":not(.child)").addClass(options.selectedClass)
                }
            }
        }

        if (e.shiftKey) {
            let last_shift_range = parent.find(".multiselectable-shift")
            last_shift_range.removeClass(options.selectedClass).removeClass("multiselectable-shift")

            let shift_range
            if (prevIndex < myIndex) {
                shift_range = item.prevUntil(".multiselectable-previous").add(prev).add(item)
            }
            else if (prevIndex > myIndex) {
                shift_range = item.nextUntil(".multiselectable-previous").add(prev).add(item)
            }
            shift_range.addClass(options.selectedClass).addClass("multiselectable-shift")
        }
        else {
            parent.find(".multiselectable-shift").removeClass("multiselectable-shift")
        }

        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            mouseDownSingle(item, parent)
        }
    }

    function mouseDownSingle(item, parent) {
        parent.find(".multiselectable-previous").removeClass("multiselectable-previous")
        if (!item.hasClass(options.selectedClass)) {
            parent.find("." + options.selectedClass).removeClass(options.selectedClass)
            item.addClass(options.selectedClass).addClass("multiselectable-previous")
            if (item.not(".child").length) {
                item.nextUntil(":not(.child)").addClass(options.selectedClass)
            }
        }
    }

    function click(e) {
        const item = $(this)
        const parent = item.parent()
        if (options.multi) {
            clickMulti(e, item, parent)
        }
        else {
            clickSingle(item, parent)
        }
    }

    function clickMulti(e, item, parent) {
        // If item wasn't dragged and is not multiselected, it should reset selection for other items.
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            clickSingle(item, parent)
        }
    }

    function clickSingle(item, parent) {
        parent.find(".multiselectable-previous").removeClass("multiselectable-previous")
        parent.find("." + options.selectedClass).removeClass(options.selectedClass)
        item.addClass(options.selectedClass).addClass("multiselectable-previous")
        if (item.not(".child").length) {
            item.nextUntil(":not(.child)").addClass(options.selectedClass)
        }
    }

    function focusin() {
        const $item = $(this)
        if ($item.hasClass("selected")) {
            return
        }
        clearAll($item.parent())
        $item.addClass(options.selectedClass)
        $item.addClass("multiselectable-previous")
    }

    function containerFocusout(event) {
        if (isFocusInSamePanel(event)) {
            return
        }
        if (isFocusInSameList(event)) {
            return
        }

        clearAll(event)
    }

    function isFocusInSamePanel(event) {
        const $parentPanelCurrent = $(event.currentTarget).parents(".panel")
        const $parentPanelRelated = $(event.relatedTarget).parents(".panel")
        const samePanel = $parentPanelCurrent.exists() && $parentPanelRelated.exists() &&
              $parentPanelCurrent[0] === $parentPanelRelated[0]
        return samePanel
    }

    function isFocusInSameList(event) {
        const $parentListCurrent = $(event.currentTarget)
        const $parentListRelated = $(event.relatedTarget).parents(".list-group")
        const sameList = $parentListCurrent.exists() && $parentListRelated.exists() &&
              $parentListCurrent[0] === $parentListRelated[0]
        return sameList
    }

    function clearAll(event) {
        const $list = $(event.currentTarget)
        $list.find(".list-group-item").removeClass(options.selectedClass)
        $list.find(".list-group-item").removeClass("multiselectable-previous")
        $list.find(".list-group-item").removeClass("multiselectable-shift")
    }

    return this.each(function() {
        const $list = $(this)
        if (!$list.data("multiselectable")) {
            $list.on("focusout", containerFocusout)
            $list.data("multiselectable", true)
                .delegate(options.items, "mousedown", mouseDown)
                .delegate(options.items, "click", click)
                .delegate(options.items, "focusin", focusin)
        }
    })
}

$.fn.multiselectable.defaults = {
    multi: false,
    selectedClass: "selected",
    items: "li"
}
