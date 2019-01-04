import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import IOSButtonBar from "/imports/layout/client/IOSButtonBar"

const MeteorContainer = withTracker(props => {

    let data = VXApp.dataContext(true)

    let visible = {}
    visible.back = props.iosState.slideMode ? !!props.iosState.minorBackLabel : !!props.iosState.majorBackLabel
    visible.edit = VXApp.isEditVisible(data)
    visible.clone = VXApp.isCloneVisible(data)
    visible.delete = VXApp.isDeleteVisible(data)
    visible.done = VXApp.isDoneEditingVisible(data)

    OLog.debug("IOSButtonBarContainer.jsx createContaner visible=" + OLog.debugString(visible))

    return {
        data : data,
        isButtonBarVisible : UX.isIosButtonBarVisible(props.iosState, visible),
        isBackVisible : visible.back,
        isEditVisible : visible.edit,
        isCloneVisible : visible.clone,
        isDeleteVisible : visible.delete,
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
