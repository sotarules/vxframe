import { withTracker } from "meteor/react-meteor-data"
import SettingsPanel from "/imports/settings/client/SettingsPanel.jsx"

export default withTracker(props => {

    if (!Session.get("SETTINGS_TAB")) {
        Session.set("SETTINGS_TAB", "system")
    }

    return {
        tabName : Session.get("SETTINGS_TAB"),
        ...props
    }

})(SettingsPanel)
