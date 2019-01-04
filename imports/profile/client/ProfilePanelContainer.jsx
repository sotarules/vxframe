import { connect } from "react-redux"

import ProfilePanel from "/imports/profile/client/ProfilePanel"

const mapStateToProps = state => {
    return {
        tabName : state.profileTab
    }
}

export default connect(
    mapStateToProps
)(ProfilePanel)
