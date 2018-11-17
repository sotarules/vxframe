import { withTracker } from "meteor/react-meteor-data"
import Signin from "/imports/signin/client/Signin.jsx"

export default withTracker(props => {
    let mode
    if (Util.isRoutePath("/enroll-account/")) {
        mode = "ENROLL"
    }
    else if (Util.isRoutePath("/reset-password/")) {
        mode = "RESET_PASSWORD"
    }
    else {
        mode = "NORMAL"
    }
    return {
        mode : mode,
        content : props.content
    }
})(Signin)
