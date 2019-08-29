import { connect } from "react-redux"
import LayoutNone from "/imports/layout/client/LayoutNone"

const mapStateToProps = state => {
    return {
        loading : state.loading,
    }
}
export default connect(
    mapStateToProps
)(LayoutNone)
