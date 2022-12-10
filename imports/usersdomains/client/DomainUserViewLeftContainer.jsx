import { withTracker } from "meteor/react-meteor-data"
import DomainUserViewLeft from "/imports/usersdomains/client/DomainUserViewLeft"

export default withTracker(( ) => {
    let domains
    domains =  VXApp.findDomainList()
    return {
        domains
    }
})(DomainUserViewLeft)
