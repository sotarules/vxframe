import { connect } from "react-redux"
import LayoutStandard from "/imports/layout/client/LayoutStandard"

const mapStateToProps = state => {
    return {
        isAuthorizedRoute : !!VXApp.isAuthorizedRoute(),
        loading : state.loading
    }
}
export default connect(
    mapStateToProps
)(LayoutStandard)
