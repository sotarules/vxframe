import { connect } from "react-redux"
import LayoutDiag from "/imports/layout/client/LayoutDiag"

const mapStateToProps = state => {
    return {
        isAuthorizedRoute : !!VXApp.isAuthorizedRoute(),
        loading : state.loading
    }
}
export default connect(
    mapStateToProps
)(LayoutDiag)
