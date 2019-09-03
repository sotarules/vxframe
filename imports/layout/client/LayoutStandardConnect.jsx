import { connect } from "react-redux"
import LayoutStandard from "/imports/layout/client/LayoutStandard"

const mapStateToProps = state => {
    const isAuthorizedRoute = !!VXApp.isAuthorizedRoute()
    return {
        isAuthorizedRoute : isAuthorizedRoute,
        loading : state.loading
    }
}
export default connect(
    mapStateToProps
)(LayoutStandard)
