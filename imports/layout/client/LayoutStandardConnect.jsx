import { connect } from "react-redux"
import LayoutStandard from "/imports/layout/client/LayoutStandard"

const mapStateToProps = state => {
    return {
        exemptRoute : state.exemptRoute,
        authorizedRoute : state.authorizedRoute,
        wideRoute : state.wideRoute,
        loading : state.loading
    }
}
export default connect(
    mapStateToProps
)(LayoutStandard)
