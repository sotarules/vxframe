import { connect } from "react-redux"
import BasicPanel from "/imports/vx/client/BasicPanel"

const mapStateToProps = state => {
    return {
        iosState : state.iosState
    }
}

export default connect(
    mapStateToProps
)(BasicPanel)
