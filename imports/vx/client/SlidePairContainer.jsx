import { connect } from "react-redux"
import SlidePair from "/imports/vx/client/SlidePair"

const mapStateToProps = state => {
    return {
        iosState : state.iosState
    }
}

export default connect(
    mapStateToProps
)(SlidePair)
