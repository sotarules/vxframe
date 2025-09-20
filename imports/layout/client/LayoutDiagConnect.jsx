import { connect } from "react-redux"
import {withTracker} from "meteor/react-meteor-data"
import LayoutDiag from "./LayoutDiag"

const mapStateToProps = state => {
    return {
        exemptRoute : state.exemptRoute,
        wideRoute : state.wideRoute,
        loading : state.loading
    }
}
const ReduxConnect = connect(
    mapStateToProps
)(LayoutDiag)

export default withTracker(() => {
    VXApp.isAuthorizedRoute()
})(ReduxConnect)
