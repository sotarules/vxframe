import { connect } from "react-redux"
import LayoutWide from "/imports/layout/client/LayoutWide"

const mapStateToProps = state => {
    return {
        exemptRoute : state.exemptRoute,
        authorizedRoute : state.authorizedRoute,
        loading : state.loading
    }
}
export default connect(
    mapStateToProps
)(LayoutWide)
