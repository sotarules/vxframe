import { withTracker } from "meteor/react-meteor-data"
import ProfilePanel from "/imports/profile/client/ProfilePanel.jsx"

export default withTracker(props => {

    if (!Session.get("PROFILE_TAB")) {
        Session.set("PROFILE_TAB", "profile");
    }

    return {
        tabName : Session.get("PROFILE_TAB"),
        ...props
    };

})(ProfilePanel)
