import { connect } from "react-redux"
import {withTracker} from "meteor/react-meteor-data"
import LayoutStandard from "./LayoutStandard"

const mapStateToProps = state => {
    return {
        exemptRoute : state.exemptRoute,
        wideRoute : state.wideRoute,
        loading : state.loading
    }
}
const ReduxConnect = connect(
    mapStateToProps
)(LayoutStandard)

export default withTracker(() => {
    VXApp.isAuthorizedRoute()
})(ReduxConnect)


