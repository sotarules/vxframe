import { withTracker } from "meteor/react-meteor-data"
import UserEditLeft from "/imports/users/client/UserEditLeft.jsx"

export default withTracker(( ) => {

    return {
        domains : VXApp.findDomainList()
    }

})(UserEditLeft)
