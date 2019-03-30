import { connect } from "react-redux"
import VXForm from "/imports/vx/client/VXForm"

const mapStateToProps = (state, ownProps) => {
    let settings = state.formData[ownProps.id] || {}
    return {
        settings : settings
    }
}

export default connect(
    mapStateToProps
)(VXForm)
