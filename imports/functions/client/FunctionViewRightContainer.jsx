import { connect } from "react-redux"
import { withTracker } from "meteor/react-meteor-data"
import FunctionViewRight from "/imports/functions/client/FunctionViewRight"

const MeteorContainer = withTracker(() => {

    let funktion

    funktion = ContextMaker.functions()

    return {
        funktion
    }

})(FunctionViewRight)

const mapStateToProps = state => {
    return {
        publishAuthoringFunction : state.publishAuthoringFunction
    }
}

export default connect(
    mapStateToProps
)(MeteorContainer)
