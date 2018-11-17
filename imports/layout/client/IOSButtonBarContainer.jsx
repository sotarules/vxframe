import { withTracker } from "meteor/react-meteor-data"
import IOSButtonBar from "/imports/layout/client/IOSButtonBar.jsx"

export default withTracker(() => {

    let data = VXApp.dataContext(true, true)

    let visible = {}
    visible.back = UX.isSlideMode() ? !!UX.getCurrentMinorBackLabel() : !!UX.getCurrentMajorBackLabel()
    visible.edit = VXApp.isEditVisible(data)
    visible.clone = VXApp.isCloneVisible(data)
    visible.delete = VXApp.isDeleteVisible(data)
    visible.done = VXApp.isDoneEditingVisible(data)

    OLog.debug("IOSButtonBarContainer.jsx createContaner visible=" + OLog.debugString(visible))

    return {
        data : data,
        isButtonBarVisible : UX.isIosButtonBarVisible(visible),
        isBackVisible : visible.back,
        isEditVisible : visible.edit,
        isCloneVisible : visible.clone,
        isDeleteVisible : visible.delete,
        isDoneEditingVisible : visible.done,
        backLabel : UX.backLabel()
    }

})(IOSButtonBar)
