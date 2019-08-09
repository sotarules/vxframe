import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import IOSButtonBar from "/imports/layout/client/IOSButtonBar"

const MeteorContainer = withTracker(props => {

    let visible = {}
    visible.back = props.iosState.slideMode ? !!props.iosState.minorBackLabel : !!props.iosState.majorBackLabel
    visible.edit = VXApp.isEditVisible()
    visible.clone = VXApp.isCloneVisible()
    visible.delete = VXApp.isDeleteVisible()
    visible.undo = VXApp.isUndoVisible()
    visible.redo = VXApp.isUndoVisible()
    visible.done = VXApp.isDoneEditingVisible()

    OLog.debug("IOSButtonBarContainer.jsx createContaner visible=" + OLog.debugString(visible))

    return {
        isButtonBarVisible : UX.isIosButtonBarVisible(props.iosState, visible),
        isBackVisible : visible.back,
        isEditVisible : visible.edit,
        isCloneVisible : visible.clone,
        isDeleteVisible : visible.delete,
        isUndoVisible : visible.undo,
        isRedoVisible : visible.redo,
        isDoneEditingVisible : visible.done,
        backLabel : UX.backLabel(props.iosState.slideMode, props.iosState.majorBackLabel, props.iosState.minorBackLabel)
    }

})(IOSButtonBar)

const mapStateToProps = state => {
    return {
        iosState : state.iosState
    }
}

export default connect(mapStateToProps)(MeteorContainer)
