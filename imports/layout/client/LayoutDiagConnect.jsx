import { connect } from "react-redux"
import {withTracker} from "meteor/react-meteor-data"
import LayoutDiag from "./LayoutDiag"
import {setAuthorizedRoute} from "/imports/vx/client/code/actions"

const mapStateToProps = state => {
    return {
        exemptRoute : state.exemptRoute,
        authorizedRoute : state.authorizedRoute,
        wideRoute : state.wideRoute,
        loading : state.loading
    }
}
const ReduxConnect = connect(
    mapStateToProps
)(LayoutDiag)

export default withTracker(() => {
    const authorizedRoute = VXApp.isAuthorizedRoute()
    Store.dispatch(setAuthorizedRoute(authorizedRoute))
})(ReduxConnect)
