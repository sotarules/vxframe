import { withTracker } from "meteor/react-meteor-data"
import DomainEditLeft from "/imports/domains/client/DomainEditLeft"

export default withTracker(( ) => {

    let users = VXApp.findUserList()
    return {
        users
    }

})(DomainEditLeft)
