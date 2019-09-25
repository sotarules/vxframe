import { withTracker } from "meteor/react-meteor-data"
import UserDomainViewLeft from "/imports/usersdomains/client/UserDomainViewLeft"

export default withTracker(( ) => {

    let users

    users = VXApp.findUserList()

    return {
        users
    }

})(UserDomainViewLeft)
