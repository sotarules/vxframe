import { withTracker } from "meteor/react-meteor-data"
import UserDomainViewLeft from "/imports/usersdomains/client/UserDomainViewLeft"

export default withTracker(( ) => {
    const users = VXApp.findUserList()
    return {
        users
    }
})(UserDomainViewLeft)
