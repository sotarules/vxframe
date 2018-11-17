import { withTracker } from "meteor/react-meteor-data"
import OffCanvasNav from "/imports/layout/client/OffCanvasNav.jsx"

export default withTracker(( ) => {

    return {
        isUserAdmin: Util.isUserAdmin(),
        isUserSuperAdmin: Util.isUserSuperAdmin()
    }

})(OffCanvasNav)
