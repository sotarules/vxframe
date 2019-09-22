import { connect } from "react-redux"
import LayoutDiag from "/imports/layout/client/LayoutDiag"

const mapStateToProps = state => {
    return {
        exemptRoute : state.exemptRoute,
        authorizedRoute : state.authorizedRoute,
        loading : state.loading
    }
}
export default connect(
    mapStateToProps
)(LayoutDiag)
