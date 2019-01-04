import { withTracker } from "meteor/react-meteor-data"
import TopBarUserPhoto from "/imports/layout/client/TopBarUserPhoto"

export default withTracker(() => {

    let photoUrl = Util.getProfileValue("photoUrl")
    let email = Util.getUserEmail()

    return {
        photoUrl : photoUrl,
        photoTooltip : email
    }

})(TopBarUserPhoto)
