import { withTracker } from "meteor/react-meteor-data"
import UserEditLeft from "/imports/users/client/UserEditLeft"

export default withTracker(( ) => {
    let domains
    domains =  VXApp.findDomainList()
    return {
        domains
    }
})(UserEditLeft)
