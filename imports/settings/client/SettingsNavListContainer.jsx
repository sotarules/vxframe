import SettingsNavList from "/imports/settings/client/SettingsNavList"
import { connect } from "react-redux"
import { setSettingsTab } from "/imports/vx/client/code/actions"

const mapStateToProps = undefined
const mapDispatchToProps = {
    setSettingsTab
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsNavList)
