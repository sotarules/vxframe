import ProfileNavList from "/imports/profile/client/ProfileNavList"
import { connect } from "react-redux"
import { setProfileTab } from "/imports/vx/client/code/actions"

const mapStateToProps = undefined
const mapDispatchToProps = {
    setProfileTab
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProfileNavList)
