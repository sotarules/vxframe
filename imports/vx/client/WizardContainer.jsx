import { connect } from "react-redux"
import Wizard from "/imports/vx/client/Wizard"

const mapStateToProps = state => {
    return {
        wizardState : state.wizardState,
        iosState : state.iosState
    }
}

export default connect(
    mapStateToProps
)(Wizard)
