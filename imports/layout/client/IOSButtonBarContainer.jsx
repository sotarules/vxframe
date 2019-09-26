import { connect } from "react-redux"
import IOSButtonBar from "/imports/layout/client/IOSButtonBar"

const mapStateToProps = state => {
    return {
        iosState : state.iosState
    }
}

export default connect(mapStateToProps)(IOSButtonBar)
