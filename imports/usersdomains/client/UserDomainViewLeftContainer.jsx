import { withTracker } from "meteor/react-meteor-data"
import UserDomainViewLeft from "/imports/usersdomains/client/UserDomainViewLeft.jsx"

export default withTracker(( ) => {

    return {
        users : VXApp.findUserList()
    }

})(UserDomainViewLeft)
